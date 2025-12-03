# AI Agent - Quick Reference

## What Changed?

### 🛡️ Safety

- Page never crashes from AI responses
- Error boundaries catch rendering issues
- Fallback to JSON viewer when needed

### 🎨 Display

- Beautiful formatted specifications
- User stories with badges and criteria
- Technical sections with organization
- Markdown-like formatting support

## Key Components

| Component            | Purpose                  | Location                  |
| -------------------- | ------------------------ | ------------------------- |
| `FeatureSpecViewer`  | Display structured specs | `frontend/components/ai/` |
| `TaskAnalysisViewer` | Display task analysis    | `frontend/components/ai/` |
| `SafeRender`         | Error boundary           | `frontend/components/ui/` |
| `JsonViewer`         | Fallback JSON display    | `frontend/components/ui/` |

## When to Use What

### Use FeatureSpecViewer When:

- Response has `userStories` array
- Response has `technicalConsiderations` object
- You want formatted document display

### Use TaskAnalysisViewer When:

- Displaying task analysis results
- Need sections for analysis/approach/prompt
- Want consistent task display

### Use SafeRender When:

- Rendering untrusted/dynamic content
- Need error boundary protection
- Want automatic fallback to JSON

### Use JsonViewer When:

- Displaying raw data as fallback
- Debugging AI responses
- Showing unexpected formats

## Common Patterns

### Pattern 1: Safe Feature Spec Display

```tsx
<SafeRender data={featureSpec}>
  {isStructuredSpec(featureSpec) ? (
    <FeatureSpecViewer spec={featureSpec.specification} />
  ) : (
    <div>{featureSpec.specification}</div>
  )}
</SafeRender>
```

### Pattern 2: Safe Task Analysis Display

```tsx
<SafeRender data={analysis}>
  <TaskAnalysisViewer
    analysis={analysis.analysis}
    suggestedApproach={analysis.suggestedApproach}
    aiAgentPrompt={analysis.aiAgentPrompt}
  />
</SafeRender>
```

### Pattern 3: Fallback to JSON

```tsx
<SafeRender data={unknownData} fallback={<JsonViewer data={unknownData} />}>
  {renderContent(unknownData)}
</SafeRender>
```

## Error Codes

| Code                         | Meaning                          | Action                                        |
| ---------------------------- | -------------------------------- | --------------------------------------------- |
| `INVALID_AI_RESPONSE_FORMAT` | AI returned unexpected structure | Check backend logs, data shown in JSON viewer |
| `NO_RESPONSE_FROM_AI`        | AI didn't return any data        | Retry request, check AI service status        |
| `AI_NOT_CONFIGURED`          | AI not set up for tenant         | Configure AI in settings                      |
| `GOOGLE_AI_API_ERROR`        | Google AI service error          | Check API key, retry later                    |

## Troubleshooting

### Issue: Spec showing as JSON instead of formatted

**Check:**

1. Does response have `userStories` or `technicalConsiderations`?
2. Are they arrays/objects as expected?
3. Check browser console for errors

**Fix:** Response structure doesn't match expected format. This is normal - JSON viewer is the fallback.

### Issue: Copy button not working

**Check:**

1. Browser clipboard permissions
2. Page has focus (click in window first)
3. Console for clipboard errors

**Fix:** Click in the window to give focus, then try copy again.

### Issue: Page showing error boundary

**Check:**

1. Browser console for error details
2. Backend logs for response format
3. Network tab for API response

**Fix:** This is working as intended - error caught, data shown in JSON viewer.

## Testing Checklist

- [ ] Feature spec displays formatted
- [ ] Task analysis displays formatted
- [ ] Copy buttons work
- [ ] Error boundaries catch errors
- [ ] JSON viewer shows for unexpected data
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] Keyboard navigation works

## Quick Commands

### View Logs

```bash
# Backend logs
cd backend && npm run dev

# Frontend console
Open browser DevTools → Console
```

### Test Error Handling

```typescript
// In ai.service.ts, temporarily add:
return { unexpected: 'format' } as any;
```

### Rebuild

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

## File Locations

```
📁 Safety Layer
├── frontend/components/ui/SafeRender.tsx
├── frontend/components/ui/JsonViewer.tsx
└── frontend/lib/utils/renderHelpers.ts

📁 Display Layer
├── frontend/components/ai/FeatureSpecViewer.tsx
└── frontend/components/ai/TaskAnalysisViewer.tsx

📁 Integration
├── frontend/components/ai/AIAssistantPanel.tsx
└── frontend/components/task/TaskCard.tsx

📁 Backend
├── backend/src/services/ai.service.ts
└── backend/src/controllers/ai.controller.ts

📁 Documentation
├── AI_QUICK_REFERENCE.md (this file)
├── AI_AGENT_IMPROVEMENTS_COMPLETE.md
├── FEATURE_SPEC_VIEWER.md
├── AI_DISPLAY_EXAMPLES.md
├── AI_RESPONSE_SAFETY.md
├── AI_SAFETY_FLOW.md
└── TEST_AI_SAFETY.md
```

## Support

**Questions?** Check the detailed docs:

- Full guide: `AI_AGENT_IMPROVEMENTS_COMPLETE.md`
- Display examples: `AI_DISPLAY_EXAMPLES.md`
- Testing guide: `TEST_AI_SAFETY.md`

**Issues?** Check:

1. Browser console
2. Backend logs
3. Network tab
4. This quick reference

**Need Help?** Review the troubleshooting section above.
