# Project File Upload Feature

## Overview

Added a comprehensive file upload system for projects that allows users to upload documentation files and automatically generate milestones and tasks from a Tasks.md file.

## Features Implemented

### 1. Database Schema

- Added `ProjectFile` model to store uploaded files
- Fields include: fileName, fileType, fileUrl, fileSize, mimeType, uploadedBy
- File types: `requirements`, `design`, `tasks`, `general`

### 2. Backend API

#### Endpoints

- `GET /api/projects/:projectId/files` - Get all files for a project
- `POST /api/projects/:projectId/files` - Upload a file (multipart/form-data)
- `DELETE /api/files/:id` - Delete a file
- `POST /api/files/:id/generate-milestones` - Generate milestones and tasks from Tasks.md

#### Services

- **ProjectFileService**: Handles file operations and Tasks.md parsing
- **Storage Integration**: Uses existing storage service for local/S3 storage
- **Markdown Parser**: Parses Tasks.md format to extract main tasks and subtasks

#### Parsing Logic

The Tasks.md parser recognizes:

- Main tasks: `- [x] 1. Task Name` or `- [ ] 1. Task Name`
- Subtasks: `- [x] 1.1 Subtask Name` or `- [ ] 1.1 Subtask Name`
- Requirements references: `_Requirements: X.Y_`
- Completion status: `[x]` = completed, `[ ]` = todo

### 3. Frontend UI

#### Files Page (`/projects/[id]/files`)

- **Recommended Files Section**: 3 dedicated upload slots for:
  - Requirements document
  - Design document
  - Tasks list (Tasks.md format)
- **General Files Section**: Unlimited file uploads
- **Generate Button**: Appears after Tasks.md upload to create milestones/tasks
- **File Management**: Download and delete capabilities

#### Navigation

- Added "Files" link to sidebar (shows when project is selected)
- Accessible at `/projects/[projectId]/files`

### 4. Workflow

1. **Create/Select Project**: User selects a project
2. **Upload Documentation**:
   - Upload Requirements.md (optional)
   - Upload Design.md (optional)
   - Upload Tasks.md (recommended for automation)
3. **Generate Milestones**: Click "Generate Milestones & Tasks" button
4. **Automatic Creation**:
   - Main tasks → Milestones
   - Subtasks → Tasks linked to milestones
   - Estimated completion dates calculated (2 weeks per milestone)
   - Status preserved from markdown (completed/todo)

### 5. File Storage

- Uses existing storage service (local or S3)
- Files stored in `projects/{projectId}/files/` directory
- Supports up to 10MB per file

## Technical Details

### Permissions

- **Upload**: Developer, Admin, Owner roles
- **Delete**: Admin, Owner roles only
- **Generate**: Admin, Owner roles only

### Validation

- File size limit: 10MB
- File types validated on upload
- Project ownership verified for all operations

### Integration Points

- Milestone Service: Creates milestones from main tasks
- Task Service: Creates tasks from subtasks
- Storage Service: Handles file storage (local/S3)
- Toast Context: User feedback for operations

## Usage Example

1. Navigate to Files page for your project
2. Upload your Tasks.md file in the "Tasks" slot
3. Click "Generate Milestones & Tasks"
4. System creates:
   - One milestone per main task (e.g., "1. Project Setup")
   - Multiple tasks per milestone (e.g., "1.1 Initialize repo", "1.2 Setup database")
   - Proper status and priority ordering

## Files Modified/Created

### Backend

- `backend/prisma/schema.prisma` - Added ProjectFile model
- `backend/src/services/projectfile.service.ts` - File operations and parsing
- `backend/src/controllers/projectfile.controller.ts` - API endpoints
- `backend/src/routes/projectfile.routes.ts` - Route definitions
- `backend/src/validators/projectfile.validator.ts` - Input validation
- `backend/src/services/storage.service.ts` - Added getFileContent method
- `backend/src/index.ts` - Registered routes

### Frontend

- `frontend/app/projects/[id]/files/page.tsx` - Files page UI
- `frontend/lib/api/projectfiles.ts` - API client
- `frontend/components/layout/Sidebar.tsx` - Added Files link

## Future Enhancements

- Support for more file formats (PDF, DOCX)
- File versioning
- File preview/viewer
- Bulk file operations
- File sharing with external users
- Integration with AI assistant for document analysis
