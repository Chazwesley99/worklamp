# AI Response History - Quick Start Guide

## For Users

### How to Use AI Response History

1. **Open any Task, Bug, or Feature Request card**
   - Navigate to Tasks, Bugs, or Features page
   - Find the card you want to analyze

2. **Expand the AI section**
   - Click the arrow button (▶) in the top-right corner
   - The AI section will slide open

3. **Generate a new analysis**
   - Click the "Generate Analysis" button
   - Wait for the AI to process (usually 2-5 seconds)
   - The analysis will appear in a highlighted section

4. **View the results**
   - Read the analysis
   - Review suggested fixes/approach
   - Copy the AI agent prompt if needed

5. **Access previous analyses**
   - Scroll down to "Previous AI Responses"
   - Click on any historical response to expand it
   - Compare different analyses

6. **Clean up old responses**
   - Click the trash icon (🗑️) next to any response
   - Confirm deletion
   - The response will be removed

### Tips

- Generate multiple analyses to get different perspectives
- Historical responses are saved automatically
- You can delete responses you don't need anymore
- All three card types work the same way
- Responses are private to your account

## For Developers

### Setup

1. **Run the database migration**

   ```bash
   cd backend
   npx prisma migrate dev
   ```

2. **Generate Prisma client**

   ```bash
   npx prisma generate
   ```

3. **Restart the backend server**

   ```bash
   npm run dev
   ```

4. **Restart the frontend**
   ```bash
   cd ../frontend
   npm run dev
   ```

### Testing

1. **Test Task Analysis**
   - Go to Tasks page
   - Create or open a task
   - Click the arrow to expand AI section
   - Click "Generate Analysis"
   - Verify response appears and is saved
   - Generate another analysis
   - Verify both appear in history

2. **Test Bug Analysis**
   - Go to Bugs page
   - Create or open a bug
   - Follow same steps as tasks
   - Verify suggested fixes appear

3. **Test Feature Spec Generation**
   - Go to Features page
   - Create or open a feature request
   - Follow same steps
   - Verify specification appears

4. **Test History Management**
   - Expand historical responses
   - Verify date formatting
   - Test delete functionality
   - Verify list updates after deletion

### API Testing

Use curl or Postman to test the endpoints:

```bash
# Save a response
curl -X POST http://localhost:3001/api/ai-responses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "task",
    "resourceId": "task-uuid-here",
    "responseData": {
      "analysis": "Test analysis",
      "suggestedApproach": ["Step 1", "Step 2"],
      "aiAgentPrompt": "Test prompt"
    }
  }'

# Get responses
curl http://localhost:3001/api/ai-responses/task/task-uuid-here \
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete a response
curl -X DELETE http://localhost:3001/api/ai-responses/response-uuid-here \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Troubleshooting

**Problem:** AI section doesn't expand

- Check browser console for errors
- Verify the card component is using the updated version
- Clear browser cache and reload

**Problem:** Responses not saving

- Check backend logs for errors
- Verify database connection
- Check authentication token is valid
- Verify the migration ran successfully

**Problem:** Historical responses not loading

- Check network tab for API errors
- Verify the resourceId is correct
- Check backend logs for database errors

**Problem:** Delete not working

- Verify user has permission
- Check backend logs
- Verify the response ID is correct

### Code Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── aiResponse.controller.ts    # CRUD operations
│   ├── routes/
│   │   └── aiResponse.routes.ts        # API routes
│   └── index.ts                         # Route registration
└── prisma/
    └── schema.prisma                    # Database schema

frontend/
├── lib/
│   └── api/
│       └── aiResponse.ts                # API client
└── components/
    ├── ai/
    │   ├── AIResponseHistory.tsx        # History display
    │   ├── BugAnalysisViewer.tsx        # Bug results
    │   └── AIAssistantPanel.tsx         # Main AI panel
    ├── task/
    │   └── TaskCard.tsx                 # Updated with AI section
    ├── bug/
    │   └── BugCard.tsx                  # Updated with AI section
    └── feature/
        └── FeatureRequestCard.tsx       # Updated with AI section
```

### Key Files Modified

- `backend/prisma/schema.prisma` - Added AIResponse model
- `backend/src/index.ts` - Registered new routes
- `frontend/components/task/TaskCard.tsx` - Added AI section
- `frontend/components/bug/BugCard.tsx` - Added AI section
- `frontend/components/feature/FeatureRequestCard.tsx` - Added AI section
- `frontend/components/ai/AIAssistantPanel.tsx` - Added auto-save

### Database Schema

```sql
CREATE TABLE "AIResponse" (
    "id" TEXT PRIMARY KEY,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "responseData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "AIResponse_resourceType_resourceId_idx"
  ON "AIResponse"("resourceType", "resourceId");
CREATE INDEX "AIResponse_createdAt_idx"
  ON "AIResponse"("createdAt");
```

### Environment Variables

No new environment variables required. Uses existing:

- `DATABASE_URL` - PostgreSQL connection
- AI configuration from existing setup

### Performance Considerations

- Responses are loaded on-demand (not on page load)
- Database queries use indexes for efficiency
- JSON storage allows flexible response formats
- No pagination needed for typical use (< 100 responses per resource)

### Security

- All endpoints require authentication
- Users can only access responses for resources they have access to
- No sensitive data stored in responses (just AI analysis)
- Standard SQL injection protection via Prisma

## Common Questions

**Q: How many responses can I save per task/bug/feature?**
A: Unlimited. However, consider deleting old responses you don't need.

**Q: Can other team members see my AI responses?**
A: Currently, responses are stored per resource, not per user. All team members with access to the resource can see the responses.

**Q: What happens if I delete a task/bug/feature?**
A: The AI responses are not automatically deleted. They remain in the database but become inaccessible.

**Q: Can I export AI responses?**
A: Not yet, but this is a planned feature. You can currently copy the text manually.

**Q: Do responses expire?**
A: No, responses are kept indefinitely unless manually deleted.

**Q: Can I edit a saved response?**
A: No, responses are immutable. Generate a new analysis if you need updated information.

## Next Steps

1. Test the feature with real tasks/bugs/features
2. Gather user feedback on the UI/UX
3. Consider implementing:
   - Response export functionality
   - Search across responses
   - Response comparison view
   - Automatic cleanup of old responses
   - User-specific response visibility
