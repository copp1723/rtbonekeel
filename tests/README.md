# Testing Framework Documentation

This directory contains tests for the application. The project uses [Vitest](https://vitest.dev/) as the primary test framework.

## Table of Contents

1. [Test Types](#test-types)
2. [Directory Structure](#directory-structure)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Test Helpers](#test-helpers)
6. [Mocking](#mocking)
7. [Database Testing](#database-testing)
8. [Frontend Testing](#frontend-testing)
9. [End-to-End Testing](#end-to-end-testing)
10. [Test Coverage](#test-coverage)
11. [Continuous Integration](#continuous-integration)
12. [Best Practices](#best-practices)
13. [Troubleshooting](#troubleshooting)

## Test Types

### Unit Tests

Unit tests verify individual functions, methods, or classes in isolation. They should be:

- Fast to execute
- Independent of external systems
- Focused on a single unit of functionality

### Integration Tests

Integration tests verify that different parts of the system work together correctly. They:

- Test interactions between components
- May involve database operations
- Verify correct API behavior

### End-to-End Tests

End-to-End (E2E) tests verify complete user workflows from start to finish. They:

- Simulate real user interactions
- Test the entire system as a whole
- Verify business requirements

## Directory Structure

```
tests/
├── unit/             # Unit tests
├── integration/      # Integration tests
├── e2e/              # End-to-end tests
├── fixtures/         # Test data and fixtures
├── helpers/          # Test helper functions
│   ├── test-utils.ts       # General test utilities
│   ├── db-test-utils.ts    # Database test utilities
│   └── api-test-utils.ts   # API test utilities
└── README.md         # This documentation
```

## Running Tests

### Running All Tests

```bash
npm test
```

### Running Specific Test Types

```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e
```

### Running Tests with Coverage

```bash
npm run test:coverage
```

### Running Tests in Watch Mode

```bash
npm run test:watch
```

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

## Test Helpers

We provide several helper utilities to make testing easier:

### General Test Utilities

```typescript
import {
  createTestFixture,
  createClassMock,
  wait,
  randomString,
  mockBcrypt
} from '../helpers/test-utils';
```

### Database Test Utilities

```typescript
import {
  createTestDb,
  cleanupTestDb,
  runTestMigrations,
  createTestTransaction,
  generateRandomRecord
} from '../helpers/db-test-utils';
```

### API Test Utilities

```typescript
import {
  createTestToken,
  createTestApp,
  createTestClient,
  authenticatedRequest,
  mockExpressReqRes,
  mockApiResponse
} from '../helpers/api-test-utils';
```

## Frontend Testing

For frontend component tests, use the provided utilities:

```typescript
import { renderWithProviders } from '../../frontend/src/test/test-utils';
import { Button } from '../../frontend/src/components/ui/Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    const { getByRole } = renderWithProviders(<Button>Click me</Button>);
    expect(getByRole('button')).toBeInTheDocument();
  });
});
```

## End-to-End Testing

End-to-end tests should focus on critical user workflows:

```typescript
import { apiClient } from '../helpers/api-test-utils';

describe('User Registration Flow', () => {
  it('should register a user and update profile', async () => {
    // Register user
    const user = await apiClient.registerUser({ /* user data */ });

    // Login
    const { token } = await apiClient.loginUser(/* credentials */);

    // Update profile
    const result = await apiClient.updateProfile(/* profile data */);

    // Verify result
    expect(result.success).toBe(true);
  });
});
```

## Troubleshooting

### Common Issues

- **Tests timing out**: Increase the timeout in the test configuration or in the specific test.
- **Database connection issues**: Ensure the test database is running and accessible.
- **Mocking issues**: Verify that mocks are set up before they are used.

### Debugging Tests

To debug tests:

1. Add `console.log` statements to your tests
2. Use the `--inspect` flag with Node.js
3. Use the `test:ui` command to run tests with the Vitest UI

## Best Practices

1. **Test in isolation**: Each test should be independent and not rely on the state from other tests.
2. **Use descriptive test names**: Test names should clearly describe what is being tested.
3. **Follow AAA pattern**: Arrange, Act, Assert.
4. **Mock external dependencies**: Use mocks for external services, databases, etc.
5. **Keep tests simple**: Each test should test one specific behavior.
6. **Test edge cases**: Include tests for error conditions and edge cases.
7. **Maintain test coverage**: Aim for high test coverage, especially for critical paths.
8. **Use test helpers**: Leverage the provided test helpers to simplify test setup and assertions.
9. **Clean up after tests**: Ensure tests clean up any resources they create.
10. **Test both success and failure cases**: Don't just test the happy path.
