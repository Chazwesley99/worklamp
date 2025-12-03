# Quick Commit Checklist ✅

## Before Every Commit

```bash
# 1. Run linting to catch errors
npm run lint

# 2. If there are auto-fixable issues
npm run lint -- --fix

# 3. Stage your changes
git add .

# 4. Commit
git commit -m "your message"
```

## Common ESLint Errors & Quick Fixes

### ❌ Unused Variable

```typescript
// ERROR
const result = await someFunction();
return otherValue;

// FIX
await someFunction();
return otherValue;
```

### ❌ Unused Parameter

```typescript
// ERROR
function handler(req, res, next) {
  return res.json({ ok: true });
}

// FIX - prefix with underscore
function handler(req, res, _next) {
  return res.json({ ok: true });
}
```

### ❌ Variable Assigned But Never Read

```typescript
// ERROR
const project = await getProject();
const updated = await updateProject();
return updated;

// FIX - remove unused assignment
await getProject(); // Just for validation
const updated = await updateProject();
return updated;
```

## If Commit Fails

1. **Read the error message** - it tells you exactly what's wrong
2. **Fix the specific file and line** mentioned in the error
3. **Re-add the fixed file**: `git add path/to/file.ts`
4. **Try committing again**: `git commit -m "message"`

## Emergency Bypass (Use Sparingly!)

```bash
git commit -m "message" --no-verify
```

⚠️ Only use when absolutely necessary - you're skipping quality checks!

## What Blocks Commits?

✅ **Warnings** - Won't block (e.g., using `any` type)
❌ **Errors** - Will block (e.g., unused variables, syntax errors)

## Today's Error

**File:** `backend/src/services/project.service.ts`
**Error:** `'project' is assigned a value but never used`
**Fix:** Changed `const project = await ...` to `await ...`
