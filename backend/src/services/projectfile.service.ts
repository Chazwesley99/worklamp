import { prisma } from '../config/database';
import { storageService } from './storage.service';
import { milestoneService } from './milestone.service';
import { taskService } from './task.service';

export class ProjectFileService {
  async getProjectFiles(projectId: string, tenantId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, tenantId },
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    const files = await prisma.projectFile.findMany({
      where: { projectId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [{ fileType: 'asc' }, { createdAt: 'desc' }],
    });

    return files;
  }

  async getFileById(fileId: string, tenantId: string) {
    const file = await prisma.projectFile.findFirst({
      where: {
        id: fileId,
        project: { tenantId },
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!file) {
      throw new Error('FILE_NOT_FOUND');
    }

    return file;
  }

  async uploadFile(
    projectId: string,
    tenantId: string,
    userId: string,
    file: Express.Multer.File,
    fileType: 'requirements' | 'design' | 'tasks' | 'general'
  ) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, tenantId },
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    const fileUrl = await storageService.storeFile(
      file.buffer,
      `projects/${projectId}/files`,
      file.originalname
    );

    const projectFile = await prisma.projectFile.create({
      data: {
        projectId,
        fileName: file.originalname,
        originalName: file.originalname,
        fileType,
        fileUrl,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedById: userId,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return projectFile;
  }

  async deleteFile(fileId: string, tenantId: string) {
    const file = await this.getFileById(fileId, tenantId);
    await storageService.deleteFile(file.fileUrl);
    await prisma.projectFile.delete({
      where: { id: fileId },
    });
    return { success: true };
  }

  async generateMilestonesFromTasksFile(fileId: string, tenantId: string, userId: string) {
    const file = await this.getFileById(fileId, tenantId);

    if (file.fileType !== 'tasks') {
      throw new Error('INVALID_FILE_TYPE');
    }

    const fileContent = await storageService.getFileContent(file.fileUrl);
    const content = fileContent.toString('utf-8');
    const parsed = this.parseTasksMarkdown(content);

    const results = {
      milestonesCreated: 0,
      tasksCreated: 0,
      milestones: [] as unknown[],
    };

    for (const mainTask of parsed.mainTasks) {
      const milestone = await milestoneService.createMilestone(file.projectId, tenantId, {
        name: mainTask.title,
        description: mainTask.description || undefined,
        estimatedCompletionDate: this.calculateEstimatedDate(mainTask.order).toISOString(),
        status: mainTask.completed ? 'completed' : 'planned',
        order: mainTask.order,
      });

      results.milestonesCreated++;
      results.milestones.push(milestone);

      for (const subtask of mainTask.subtasks) {
        await taskService.createTask(file.projectId, tenantId, userId, {
          title: subtask.title,
          description: subtask.description || undefined,
          milestoneId: milestone.id,
          status: subtask.completed ? 'done' : 'todo',
          priority: subtask.order,
          assignedUserIds: [],
        });
        results.tasksCreated++;
      }
    }

    return results;
  }

  private parseTasksMarkdown(content: string) {
    const lines = content.split('\n');
    const mainTasks: Array<{
      title: string;
      description: string | null;
      completed: boolean;
      order: number;
      subtasks: Array<{
        title: string;
        description: string | null;
        completed: boolean;
        order: number;
      }>;
    }> = [];

    let currentMainTask: (typeof mainTasks)[0] | null = null;
    let currentSubtask: (typeof mainTasks)[0]['subtasks'][0] | null = null;
    let mainTaskOrder = 0;
    let subtaskOrder = 0;
    const subtaskBullets: string[] = [];

    for (const line of lines) {
      // Match main tasks: - [x] or - [ ] followed by number and period
      const mainTaskMatch = line.match(/^-\s+\[(x| )\]\s+(\d+)\.\s+(.+)$/i);
      if (mainTaskMatch) {
        // Save previous subtask with its bullets
        if (currentSubtask && currentMainTask) {
          if (subtaskBullets.length > 0) {
            currentSubtask.description = subtaskBullets.join('\n');
          }
          currentMainTask.subtasks.push(currentSubtask);
          currentSubtask = null;
          subtaskBullets.length = 0;
        }

        // Save previous main task
        if (currentMainTask) {
          mainTasks.push(currentMainTask);
        }

        const stepNumber = mainTaskMatch[2];
        const taskName = mainTaskMatch[3].trim();
        currentMainTask = {
          title: `${stepNumber}. ${taskName}`, // Keep the number in the title
          description: null,
          completed: mainTaskMatch[1].toLowerCase() === 'x',
          order: mainTaskOrder++,
          subtasks: [],
        };
        subtaskOrder = 0;
        continue;
      }

      // Match subtasks: - [x] or - [ ] followed by number.number
      const subtaskMatch = line.match(/^-\s+\[(x| |\*)\]\s*(\d+\.\d+)\s+(.+)$/i);
      if (subtaskMatch && currentMainTask) {
        // Save previous subtask with its bullets
        if (currentSubtask) {
          if (subtaskBullets.length > 0) {
            currentSubtask.description = subtaskBullets.join('\n');
          }
          currentMainTask.subtasks.push(currentSubtask);
          subtaskBullets.length = 0;
        }

        const title = subtaskMatch[3].trim();
        const completed = subtaskMatch[1].toLowerCase() === 'x';

        // Clean up the title (remove Requirements reference)
        const cleanTitle = title.replace(/_Requirements?:.*?_/gi, '').trim();

        currentSubtask = {
          title: cleanTitle,
          description: null,
          completed,
          order: subtaskOrder++,
        };
        continue;
      }

      // Match bullet points under subtasks (indented with spaces)
      const bulletMatch = line.match(/^\s{2,}-\s+(.+)$/);
      if (bulletMatch && currentSubtask) {
        subtaskBullets.push(`• ${bulletMatch[1].trim()}`);
      }
    }

    // Save last subtask
    if (currentSubtask && currentMainTask) {
      if (subtaskBullets.length > 0) {
        currentSubtask.description = subtaskBullets.join('\n');
      }
      currentMainTask.subtasks.push(currentSubtask);
    }

    // Save last main task
    if (currentMainTask) {
      mainTasks.push(currentMainTask);
    }

    return { mainTasks };
  }

  private calculateEstimatedDate(order: number): Date {
    const now = new Date();
    const weeksToAdd = (order + 1) * 2;
    now.setDate(now.getDate() + weeksToAdd * 7);
    return now;
  }
}

export const projectFileService = new ProjectFileService();
