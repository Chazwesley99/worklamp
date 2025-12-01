import { prisma } from '../config/database';

export class ProjectService {
  /**
   * Get all projects for a tenant
   */
  async getProjectsByTenant(tenantId: string) {
    const projects = await prisma.project.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return projects;
  }

  /**
   * Get project by ID
   */
  async getProjectById(projectId: string, tenantId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        tenantId, // Ensure tenant isolation
      },
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    return project;
  }

  /**
   * Create a new project
   */
  async createProject(
    tenantId: string,
    data: {
      name: string;
      description?: string;
      publicBugTracking?: boolean;
      publicFeatureRequests?: boolean;
    }
  ) {
    const project = await prisma.project.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        publicBugTracking: data.publicBugTracking ?? false,
        publicFeatureRequests: data.publicFeatureRequests ?? false,
        status: 'active',
      },
    });

    return project;
  }

  /**
   * Update project
   */
  async updateProject(
    projectId: string,
    tenantId: string,
    data: {
      name?: string;
      description?: string;
      status?: string;
      publicBugTracking?: boolean;
      publicFeatureRequests?: boolean;
    }
  ) {
    // Verify project belongs to tenant (throws if not found)
    await this.getProjectById(projectId, tenantId);

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data,
    });

    return updatedProject;
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string, tenantId: string) {
    // Verify project belongs to tenant
    await this.getProjectById(projectId, tenantId);

    await prisma.project.delete({
      where: { id: projectId },
    });

    return { success: true };
  }
}

export const projectService = new ProjectService();
