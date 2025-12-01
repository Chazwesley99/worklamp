# Frontend Tests

This directory contains all frontend tests for the Worklamp platform.

## Directory Structure

```
__tests__/
├── components/        # Component tests
├── hooks/            # Custom hook tests
├── utils/            # Utility function tests
└── *.test.tsx        # Individual test files
```

## Test Types

### Component Tests

Test React components using React Testing Library.

Example: `components/Button.test.tsx`

### Hook Tests

Test custom React hooks.

Example: `hooks/useAuth.test.ts`

### Utility Tests

Test utility functions and helpers.

Example: `utils/validation.test.ts`

## Running Tests

```bash
# Run all frontend tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run specific test file
npm run test -- Button.test.tsx

# Run with coverage
npm run test -- --coverage
```

## Writing Tests

### Component Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### Hook Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '@/hooks/useCounter';

describe('useCounter', () => {
  it('increments counter', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

## Testing Library Queries

Prefer queries in this order:

1. `getByRole` - Most accessible
2. `getByLabelText` - Good for forms
3. `getByPlaceholderText` - For inputs
4. `getByText` - For non-interactive elements
5. `getByTestId` - Last resort

## Best Practices

1. Test user behavior, not implementation details
2. Use semantic queries (getByRole, getByLabelText)
3. Avoid testing internal state
4. Test accessibility
5. Keep tests simple and focused
6. Use userEvent for interactions
7. Clean up after tests

## Mocking

### Mocking API Calls

```typescript
import { vi } from 'vitest';

vi.mock('@/lib/api', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: 'mocked' })),
}));
```

### Mocking Next.js Router

```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/',
  }),
}));
```

## Accessibility Testing

Always test for accessibility:

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```
