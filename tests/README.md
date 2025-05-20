# Testing Guide

This directory contains tests for the RowTheBoat application. The project uses [Vitest](https://vitest.dev/) as the test framework.

## Running Tests

To run all tests:

```bash
npm test
```

To run tests in watch mode (tests will re-run when files change):

```bash
npm run test:watch
```

## Test Structure

Tests are organized as follows:

- `tests/` - Root test directory for application tests
- `src/tests/` - Legacy test directory (will be migrated to the root tests directory)

## Writing Tests

### Test File Naming

- Unit tests: `*.test.ts`
- Integration tests: `*.spec.ts`

### Test File Structure

```typescript
/**
 * [Component/Module] Tests
 * 
 * Tests for [brief description]
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { moduleToTest } from '../path/to/module.js';

// Optional: Mock dependencies
vi.mock('../path/to/dependency', () => ({
  someFunction: vi.fn(),
}));

describe('Module Name', () => {
  // Setup before each test if needed
  beforeEach(() => {
    // Setup code
  });

  // Cleanup after each test if needed
  afterEach(() => {
    // Cleanup code
    vi.clearAllMocks();
  });

  it('should do something specific', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = moduleToTest(input);
    
    // Assert
    expect(result).toBe('expected output');
  });
});
```

### Mocking

Vitest provides built-in mocking capabilities:

```typescript
// Mock a module
vi.mock('../path/to/module');

// Mock a specific function
const mockFn = vi.fn().mockReturnValue('mocked value');

// Spy on a method
const spy = vi.spyOn(object, 'method');

// Clear all mocks
vi.clearAllMocks();

// Reset all mocks
vi.resetAllMocks();

// Restore original implementation
vi.restoreAllMocks();
```

### Testing Asynchronous Code

```typescript
it('should handle async operations', async () => {
  // Arrange
  const input = 'test';
  
  // Act
  const result = await asyncFunction(input);
  
  // Assert
  expect(result).toBe('expected output');
});
```

### Testing Database Operations

For database operations, use mocks to avoid actual database calls in unit tests:

```typescript
// Mock the database module
vi.mock('../shared/db', () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn().mockResolvedValue({ id: 'test-id', name: 'Test User' })
      }
    },
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([{ id: 'test-id' }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([{ id: 'test-id' }]),
    delete: vi.fn().mockReturnThis(),
  }
}));
```

## Test Coverage

To generate a test coverage report:

```bash
npm run test:coverage
```

This will create a coverage report in the `coverage/` directory.

## Continuous Integration

Tests are automatically run in the CI pipeline for every pull request and push to the main branch.

## Best Practices

1. **Test in isolation**: Each test should be independent and not rely on the state from other tests.
2. **Use descriptive test names**: Test names should clearly describe what is being tested.
3. **Follow AAA pattern**: Arrange, Act, Assert.
4. **Mock external dependencies**: Use mocks for external services, databases, etc.
5. **Keep tests simple**: Each test should test one specific behavior.
6. **Test edge cases**: Include tests for error conditions and edge cases.
7. **Maintain test coverage**: Aim for high test coverage, especially for critical paths.
