# Backend Tests

This directory contains all backend tests for the Worklamp platform.

## Directory Structure

```
__tests__/
├── integration/        # Integration tests for API endpoints
├── property/          # Property-based tests
├── services/          # Service layer unit tests
├── utils/             # Test utilities and helpers
├── setup.ts           # Global test setup
└── *.test.ts          # Individual test files
```

## Test Types

### Unit Tests

Test individual functions, services, and utilities in isolation.

Example: `services/auth.service.test.ts`

### Integration Tests

Test complete API request/response cycles with database interactions.

Example: `integration/auth.test.ts`

### Property-Based Tests

Test universal properties that should hold across all inputs using fast-check.

Example: `property/tenant-isolation.test.ts`

## Running Tests

```bash
# Run all backend tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run specific test file
npm run test -- health.test.ts

# Run with coverage
npm run test -- --coverage
```

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../services/myService';

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Integration Test Example

```typescript
import { describe, it, expect, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../index';
import { cleanupTestData } from '../utils/test-helpers';

describe('POST /api/endpoint', () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  it('should create resource', async () => {
    const response = await request(app).post('/api/endpoint').send({ data: 'value' });

    expect(response.status).toBe(201);
  });
});
```

### Property-Based Test Example

```typescript
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// **Feature: worklamp-platform, Property 1: Description**
describe('Property Test', () => {
  it('should hold for all inputs', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        // Test property
        expect(someFunction(input)).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });
});
```

## Test Helpers

Use the test helpers from `utils/test-helpers.ts`:

```typescript
import {
  createTestUser,
  createTestTenant,
  createTestProject,
  cleanupTestData,
} from './utils/test-helpers';
```

## Best Practices

1. Always clean up test data after tests
2. Use descriptive test names
3. Keep tests isolated and independent
4. Use test helpers for common setup
5. Tag property-based tests with property references
6. Run tests before committing code
