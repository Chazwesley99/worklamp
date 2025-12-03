# Testing AI Response Safety Features

## Quick Test Guide

### Test 1: Normal AI Response (Should Work Normally)

1. Start the application:

   ```bash
   npm run dev
   ```

2. Navigate to Tasks page
3. Click the 🤖 icon on any task
4. Verify the AI analysis displays normally with:
   - Analysis text
   - Suggested Approach (bullet list)
   - AI Agent Prompt (code block)

**Expected:** Normal display, no errors

### Test 2: Verify Error Boundaries Work

To test that the safety features work, you can temporarily modify the backend to return malformed data:

1. Open `backend/src/services/ai.service.ts`
2. In the `analyzeTask` method, before the return statement, add:

   ```typescript
   // TEST: Return malformed data
   return {
     suggestedApproach: { nested: 'object' }, // Should be array
     aiAgentPrompt: { another: 'object' }, // Should be string
     analysis: { yet: 'another' }, // Should be string
   } as any;
   ```

3. Restart backend
4. Click 🤖 on a task
5. Verify you see:
   - ⚠️ Warning boxes with "Raw Response Data"
   - Expandable JSON viewers
   - No page crash
   - All data visible

**Expected:** Graceful degradation with JSON viewer, no crash

### Test 3: Verify Features Page

1. Navigate to Features page
2. Create or edit a feature
3. Click "Generate Spec" button
4. Verify AI Assistant panel displays correctly

**Expected:** Normal display or graceful JSON fallback

### Test 4: Verify Bugs Page

1. Navigate to Bugs page
2. Create or edit a bug
3. Click "Analyze Bug" button
4. Verify AI Assistant panel displays correctly

**Expected:** Normal display or graceful JSON fallback

## What to Look For

### ✅ Good Signs

- Page never crashes
- All data is visible (even if as JSON)
- Copy buttons work
- Clear error messages if format is unexpected
- Yellow warning boxes for unexpected formats
- Expandable JSON viewers

### ❌ Bad Signs

- White screen / page crash
- "Objects are not valid as a React child" error
- Data not visible
- Console errors about rendering

## Rollback Instructions

If issues occur, revert these files:

```bash
git checkout HEAD -- \
  backend/src/services/ai.service.ts \
  backend/src/controllers/ai.controller.ts \
  frontend/components/task/TaskCard.tsx \
  frontend/components/ai/AIAssistantPanel.tsx \
  frontend/components/ui/JsonViewer.tsx \
  frontend/components/ui/SafeRender.tsx \
  frontend/lib/utils/renderHelpers.ts
```

## Monitoring in Production

Watch for these in logs:

- `INVALID_AI_RESPONSE_FORMAT` errors (backend)
- "SafeRender caught an error" (frontend console)
- Increased 502 responses from AI endpoints

These indicate AI is returning unexpected formats and the safety features are working.
