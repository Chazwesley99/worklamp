# Git Commit Troubleshooting Guide

## The Issue

When you try to commit code, the pre-commit hook runs **lint-staged** which automatically runs:

1. **ESLint** with `--fix` flag on all `.ts`, `.tsx`, `.js`, `.jsx` files
2. **Prettier** with `--write` flag on all files

If ESLint finds any **errors** (not warnings), the commit will be blocked and rolled back.

## What Happened This Time

The commit was blocked because of **1 ESLint error**:

```
backend/src/services/project.service.ts
  75:11  error  'project' is assigned a value but never used  @typescript-eslint/no-unused-vars
```

The code had:

```typescript
const project = await this.getProjectById(projectId, tenantId);
// project variable was never used after this
```

**Fix:** Changed to:

```typescript
await this.getProjectById(projectId, tenantId);
// No unused variable
```

## How to Prevent This in the Future

### 1. Run Linting Before Committing

Always run these commands before committing:

```bash
# Check for errors in backend
cd backend
npm run lint

# Check for errors in frontend
cd frontend
npm run lint

# Or from root, check all workspaces
npm run lint
```

### 2. Common ESLint Errors to Watch For

#### ❌ Unused Variables

```typescript
// BAD - variable assigned but never used
const result = await someFunction();
return otherValue;

// GOOD - either use it or don't assign it
await someFunction();
return otherValue;
```

#### ❌ Unused Function Parameters

```typescript
// BAD - parameter declared but never used
function handler(req, res, next) {
  return res.json({ ok: true });
  // 'next' is never used
}

// GOOD - prefix with underscore to indicate intentionally unused
function handler(req, res, _next) {
  return res.json({ ok: true });
}
```

#### ❌ Missing Return Types (if strict mode enabled)

```typescript
// BAD
async function getData() {
  return await fetch('/api/data');
}

// GOOD
async function getData(): Promise<Response> {
  return await fetch('/api/data');
}
```

### 3. Understanding Warnings vs Errors

**Warnings** (won't block commits):

- `@typescript-eslint/no-explicit-any` - Using `any` type (set to "warn" in config)
- `no-console` - Using console.log (allowed in certain files)

**Errors** (will block commits):

- `@typescript-eslint/no-unused-vars` - Unused variables
- Syntax errors
- Type errors that ESLint catches

### 4. Quick Fix Commands

If you get blocked by ESLint:

```bash
# See what the errors are
git commit -m "your message"
# Read the error output carefully

# Fix the specific files mentioned
# Then add them again
git add path/to/fixed/file.ts

# Try committing again
git commit -m "your message"
```

### 5. Bypass Pre-commit Hook (Emergency Only)

If you absolutely need to commit without fixing linting errors (NOT recommended):

```bash
git commit -m "your message" --no-verify
```

⚠️ **Warning:** Only use this in emergencies. The linting rules exist to maintain code quality.

### 6. Auto-fix What You Can

ESLint can auto-fix many issues:

```bash
# In backend
cd backend
npm run lint -- --fix

# In frontend
cd frontend
npm run lint -- --fix
```

## Your Project's Lint Configuration

Located in `.eslintrc.json`:

```json
{
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": ["warn", { "allow": ["warn", "error", "log"] }]
  }
}
```

**Key points:**

- Unused variables are **errors** (will block commits)
- Using `any` type is a **warning** (won't block commits)
- Prefix unused parameters with `_` to ignore them
- console.log/warn/error are allowed

## Husky Pre-commit Hook

Located in `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

This runs **lint-staged** which uses the config in `.lintstagedrc.json`:

```json
{
  "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

## Summary

**To avoid commit failures:**

1. ✅ Run `npm run lint` before committing
2. ✅ Fix all ESLint **errors** (warnings are okay)
3. ✅ Use `_` prefix for intentionally unused parameters
4. ✅ Remove unused variables or use them
5. ✅ Let ESLint auto-fix what it can with `--fix` flag

**The error this time:** Unused variable `project` in `project.service.ts`
**The fix:** Changed `const project = await ...` to `await ...`
