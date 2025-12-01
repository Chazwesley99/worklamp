# Test Configuration

## Overview

The Worklamp platform uses a comprehensive testing strategy with multiple testing approaches:

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and workflows
- **Property-Based Tests**: Test universal properties with fast-check
- **E2E Tests**: Test complete user journeys (to be added)

## Testing Frameworks

### Frontend Testing

- **Vitest**: Fast unit test runner
- **React Testing Library**: Component testing utilities
- **jsdom**: DOM environment for tests

### Backend Testing

- **Vitest**: Fast unit test runner
- **Supertest**: HTTP assertion library for API testing
- **fast-check**: Property-based testing library

## Running Tests

### All Tests

```bash
npm run test
```

### Frontend Tests Only

```bash
npm run test --workspace=frontend
```

### Backend Tests Only

```bash
npm run test --workspace=backend
```

### Watch Mode (Development)

```bash
# Frontend
cd frontend && npm run test -- --watch

# Backend
cd backend && npm run test -- --watch
```

## Test Structure

### Frontend Tests

Located in `frontend/__tests__/`

Example structure:

```
frontend/
├── __tests__/
│   ├── components/
│   │   └── Button.test.tsx
│   ├── hooks/
│   │   └── useAuth.test.ts
│   └── utils/
│       └── validation.test.ts
```

### Backend Tests

Located in `backend/src/__tests__/`

Example structure:

```
backend/src/
├── __tests__/
│   ├── api/
│   │   ├── auth.test.ts
│   │   └── projects.test.ts
│   ├── services/
│   │   └── auth.service.test.ts
│   ├── utils/
│   │   └── test-helpers.ts
│   └── property/
│       └── tenant-isolation.test.ts
```

## Property-Based Testing

### Configuration

- Minimum 100 iterations per property test
- Tests are tagged with property references from design document

### Example Property Test

```typescript
// **Feature: worklamp-platform, Property 5: Tenant data isolation**
it('tenant data isolation', () => {
  fc.assert(
    fc.property(fc.record({ tenantId: fc.uuid(), userId: fc.uuid() }), async (context) => {
      // Test implementation
    }),
    { numRuns: 100 }
  );
});
```

## Test Helpers

### Backend Test Helpers

Located in `backend/src/__tests__/utils/test-helpers.ts`

Available helpers:

- `createTestUser()`: Create a test user
- `createTestTenant()`: Create a test tenant
- `createTestProject()`: Create a test project
- `cleanupTestData()`: Clean up all test data
- `disconnectTestDatabase()`: Disconnect from test database

### Usage Example

```typescript
import { createTestUser, createTestTenant, cleanupTestData } from './utils/test-helpers';

describe('My Test Suite', () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  it('should do something', async () => {
    const user = await createTestUser();
    const tenant = await createTestTenant(user.id);
    // Test logic here
  });
});
```

## Environment Variables for Testing

Create a `.env.test` file in the backend directory:

```bash
DATABASE_URL_TEST=postgresql://worklamp:worklamp_dev_password@localhost:5432/worklamp_test
REDIS_URL=redis://localhost:6379
JWT_SECRET=test-jwt-secret
JWT_REFRESH_SECRET=test-refresh-secret
SESSION_SECRET=test-session-secret
```

## Coverage

To generate coverage reports:

```bash
# Frontend
cd frontend && npm run test -- --coverage

# Backend
cd backend && npm run test -- --coverage
```

Coverage reports will be generated in the `coverage/` directory.

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Always clean up test data after tests
3. **Descriptive Names**: Use clear, descriptive test names
4. **Arrange-Act-Assert**: Follow the AAA pattern in tests
5. **Mock Sparingly**: Prefer real implementations over mocks when possible
6. **Property Tests**: Use property-based tests for universal properties
7. **Fast Tests**: Keep tests fast by avoiding unnecessary setup

## Continuous Integration

Tests are run automatically on:

- Pre-commit (via Husky)
- Pull requests
- Main branch pushes

## Troubleshooting

### Database Connection Issues

Ensure PostgreSQL is running:

```bash
docker-compose -f docker-compose.dev.yml up -d postgres
```

### Redis Connection Issues

Ensure Redis is running:

```bash
docker-compose -f docker-compose.dev.yml up -d redis
```

### Test Timeouts

Increase timeout in vitest.config.ts:

```typescript
test: {
  testTimeout: 10000, // 10 seconds
}
```
