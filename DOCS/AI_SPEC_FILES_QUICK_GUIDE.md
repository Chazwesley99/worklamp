# AI Spec Files Integration - Quick Guide

## For Users

### How to Use

1. **Upload Spec Files**: Go to your project's Files page and upload:
   - `requirements.md` (select "Requirements" as file type)
   - `design.md` (select "Design" as file type)

2. **Use AI Analysis**: When viewing Tasks, Bugs, or Feature Requests:
   - Click the 🤖 AI Assistant button
   - The AI will automatically include your spec files in the analysis
   - Get context-aware suggestions based on your project's requirements and design

3. **Bug Screenshots**: When reporting bugs:
   - Click "Report Bug" or edit an existing bug
   - Upload a screenshot (up to 10MB)
   - The screenshot will be included in AI analysis for visual context

### What Gets Included

- ✅ Project requirements (requirements.md)
- ✅ Project design documentation (design.md)
- ✅ Bug screenshots (when available)
- ✅ Task/Bug/Feature details (title, description, priority, etc.)

## For Developers

### Adding AI Analysis to New Components

```typescript
// 1. Import the AI API
import { aiApi } from '@/lib/api/ai';

// 2. Call the appropriate analysis method with projectId
const result = await aiApi.analyzeTask({
  title: task.title,
  description: task.description,
  category: task.category,
  priority: task.priority,
  status: task.status,
  projectId: projectId, // Pass the project ID
  includeSpecFiles: true, // Enable spec file inclusion
});

// 3. Use the result
console.log(result.analysis);
console.log(result.suggestedApproach);
console.log(result.aiAgentPrompt);
```

### API Endpoints

#### Analyze Bug

```typescript
POST /api/ai/analyze-bug
{
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  projectId?: string;           // Optional: Include spec files
  includeSpecFiles?: boolean;   // Optional: Default true
}
```

#### Analyze Task

```typescript
POST /api/ai/analyze-task
{
  title: string;
  description: string;
  category?: string;
  priority: number;
  status: string;
  projectId?: string;           // Optional: Include spec files
  includeSpecFiles?: boolean;   // Optional: Default true
}
```

#### Generate Feature Spec

```typescript
POST /api/ai/generate-feature-spec
{
  title: string;
  description?: string;
  projectId?: string;           // Optional: Include spec files
  includeSpecFiles?: boolean;   // Optional: Default true
}
```

### Component Props Pattern

When creating components that use AI analysis:

```typescript
interface MyComponentProps {
  // ... other props
  projectId?: string;  // Add projectId prop
}

export function MyComponent({ projectId, ...otherProps }: MyComponentProps) {
  // Pass projectId to AI components
  return (
    <AIAssistantPanel
      type="bug"
      title={title}
      description={description}
      projectId={projectId}
      includeSpecFiles={true}
    />
  );
}
```

### Backend Service Pattern

To add spec file support to new AI features:

```typescript
// 1. Fetch spec files
let specFiles: { requirements?: string; design?: string } = {};
if (input.includeSpecFiles && input.projectId) {
  specFiles = await this.getSpecFilesContent(input.projectId, tenantId);
}

// 2. Include in prompt
if (specFiles.requirements) {
  prompt += `\n\n=== PROJECT REQUIREMENTS ===\n${specFiles.requirements}\n=== END REQUIREMENTS ===`;
}

if (specFiles.design) {
  prompt += `\n\n=== PROJECT DESIGN ===\n${specFiles.design}\n=== END DESIGN ===`;
}

if (specFiles.requirements || specFiles.design) {
  prompt += `\n\nPlease consider the above project specifications when analyzing...`;
}
```

## Troubleshooting

### Spec Files Not Being Included

- ✅ Verify files are uploaded with correct file types (Requirements/Design)
- ✅ Check that `projectId` is being passed to the AI component
- ✅ Ensure `includeSpecFiles` is set to `true` (default)
- ✅ Check backend logs for file reading errors

### AI Not Providing Context-Aware Suggestions

- ✅ Verify spec files contain relevant information
- ✅ Check file format is markdown (.md)
- ✅ Ensure files are not empty
- ✅ Review AI prompt in response to see if files were included

### Screenshot Not Showing in Analysis

- ✅ Verify image was uploaded successfully (check bug.imageUrl)
- ✅ Ensure image is under 10MB
- ✅ Check image format is supported (jpg, png, gif, etc.)
- ✅ Verify imageUrl is being passed to AI analysis

## Best Practices

1. **Keep Spec Files Updated**: Regularly update requirements.md and design.md as your project evolves
2. **Use Clear Formatting**: Use markdown headers and lists for better AI parsing
3. **Include Context**: Add relevant technical details, constraints, and standards
4. **Test AI Suggestions**: Verify that AI suggestions align with your project needs
5. **Provide Feedback**: If AI suggestions are off-target, update your spec files with more context

## Examples

### Good Requirements.md Structure

```markdown
# Project Requirements

## Core Features

- User authentication with OAuth
- Real-time collaboration
- File upload and management

## Technical Constraints

- Must support 10,000+ concurrent users
- Response time < 200ms
- Mobile-first design

## Security Requirements

- All data encrypted at rest
- GDPR compliant
- Regular security audits
```

### Good Design.md Structure

```markdown
# Project Design

## Architecture

- Microservices architecture
- React frontend with Next.js
- Node.js backend with Express
- PostgreSQL database

## Design Patterns

- Repository pattern for data access
- Service layer for business logic
- JWT for authentication

## API Standards

- RESTful API design
- JSON response format
- Versioned endpoints (/api/v1/...)
```
