# AI Response History Feature

## Overview

The AI Response History feature allows users to save and view historical AI analysis results for Tasks, Bugs, and Feature Requests. Each card now has a consistent expandable AI section that shows both the current analysis and previous responses.

## Database Schema

### AIResponse Table

```prisma
model AIResponse {
  id           String   @id @default(uuid())
  resourceType String   // 'task' | 'bug' | 'feature'
  resourceId   String
  responseData Json     // Store the full AI response JSON
  createdAt    DateTime @default(now())

  @@index([resourceType, resourceId])
  @@index([createdAt])
}
```

## Backend API

### Endpoints

- `POST /api/ai-responses` - Save a new AI response
- `GET /api/ai-responses/:resourceType/:resourceId` - Get all responses for a resource
- `DELETE /api/ai-responses/:id` - Delete a specific response

### Request/Response Examples

**Save Response:**

```json
POST /api/ai-responses
{
  "resourceType": "task",
  "resourceId": "uuid-here",
  "responseData": {
    "analysis": "...",
    "suggestedApproach": [...],
    "aiAgentPrompt": "..."
  }
}
```

**Get Responses:**

```json
GET /api/ai-responses/task/uuid-here
[
  {
    "id": "response-uuid",
    "resourceType": "task",
    "resourceId": "uuid-here",
    "responseData": {...},
    "createdAt": "2024-12-06T15:00:00Z"
  }
]
```

## Frontend Components

### Updated Cards

All three card types now have a consistent AI section:

1. **TaskCard** - Shows task analysis with suggested approach
2. **BugCard** - Shows bug analysis with suggested fixes
3. **FeatureRequestCard** - Shows feature specification

### Common Features

Each card now includes:

- **Expandable AI Section** - Click the arrow (▶/▼) to toggle
- **Generate Button** - Creates a new AI analysis
- **Current Analysis** - Shows the most recent analysis in a highlighted section
- **Previous Responses** - Expandable list of historical responses
- **Date Labels** - Each historical response is labeled "AI Response from YYYY-MM-DD HH:MM"
- **Delete Option** - Remove individual historical responses

### AIResponseHistory Component

Reusable component that:

- Loads historical responses for a resource
- Displays them in expandable cards (newest first)
- Allows deletion of individual responses
- Accepts a custom render function for displaying response data

## User Experience

### Workflow

1. User opens a Task/Bug/Feature card
2. Clicks the arrow button to expand the AI section
3. Clicks "Generate Analysis" to create a new AI response
4. The response is displayed and automatically saved to history
5. Previous responses appear below in collapsible sections
6. User can expand any previous response to view it
7. User can delete unwanted historical responses

### Visual Consistency

All cards now have:

- Same expansion button (▶/�▼)
- Same "Generate..." button style
- Same historical response layout
- Same date formatting
- Same delete functionality

## Technical Details

### Auto-Save

When a user generates a new AI analysis:

1. The AI API is called
2. The response is displayed immediately
3. The response is saved to the database in the background
4. The history list is refreshed to show the new entry

### Error Handling

- If saving fails, the analysis is still shown to the user
- Errors are logged to the console but don't interrupt the user flow
- Toast notifications inform users of any issues

### Performance

- Historical responses are loaded on-demand when the AI section is expanded
- Responses are cached until the section is collapsed and re-opened
- The `key` prop with `refreshHistory` ensures the list updates after new analyses

## Migration

The database migration `20251206150421_add_ai_response_table` creates the AIResponse table with appropriate indexes for efficient querying.

Run the migration with:

```bash
cd backend
npx prisma migrate dev
```

## Future Enhancements

Potential improvements:

- Export historical responses
- Search/filter historical responses
- Compare two responses side-by-side
- Set response retention policies
- Share responses with team members
