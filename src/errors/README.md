# Error Handling System

This directory contains a comprehensive error handling system for the application. It provides standardized error classes, utilities, and handlers to ensure consistent error handling across the codebase.

## Directory Structure

```
src/errors/
├── types/           # Error class definitions
│   ├── BaseError.ts # Base error class and error codes
│   └── DomainErrors.ts # Domain-specific error classes
├── utils/           # Error utilities
│   └── errorUtils.ts # Type guards and error transformation
├── handlers/        # Error handlers
│   ├── errorHandlers.ts # Error handling functions
│   └── retryHandler.ts # Retry logic for operations
├── index.ts         # Main exports
└── README.md        # This file
```

## Key Components

### Error Classes

- `BaseError`: Foundation class for all application errors
- Domain-specific error classes:
  - `ValidationError`: For input validation failures (400)
  - `AuthenticationError`: For authentication failures (401)
  - `AuthorizationError`: For authorization failures (403)
  - `NotFoundError`: For resource not found (404)
  - `DatabaseError`: For database operation failures (500)
  - `ExternalServiceError`: For external service failures (502)
  - `RateLimitError`: For rate limiting (429)
  - `WorkflowError`: For workflow execution failures (500)
  - `InternalError`: For unexpected internal errors (500)

### Error Utilities

- Type guards:
  - `isError`: Check if a value is an Error
  - `isBaseError`: Check if a value is a BaseError
  - `isErrorWithMessage`: Check if a value has a message property
  - `isErrorOfType`: Check if an error is a specific type

- Error transformation:
  - `toBaseError`: Convert any error to a BaseError
  - `enrichError`: Add details to an error
  - `formatError`: Format an error for logging

- Message extraction:
  - `getErrorMessage`: Get a clean error message from any error
  - `getErrorStack`: Get the stack trace from an error

### Error Handlers

- Express middleware:
  - `errorHandlerMiddleware`: Handle errors in Express routes
  - `notFoundMiddleware`: Handle 404 errors
  - `asyncHandler`: Catch errors in async route handlers

- Global handlers:
  - `setupGlobalErrorHandlers`: Set up handlers for uncaught exceptions

- Function wrappers:
  - `tryCatch`: Wrap a function with error handling
  - `executeWithRetry`: Retry a function with exponential backoff

## Usage Examples

### Throwing Errors

```typescript
// Basic error
throw new ValidationError('Invalid input');

// With details
throw new ValidationError(
  'Invalid input',
  { field: 'email', value: input.email }
);

// With cause
try {
  await db.query('SELECT * FROM users');
} catch (err) {
  throw new DatabaseError(
    'Failed to fetch users',
    'DATABASE_ERROR',
    { operation: 'fetchUsers' },
    err
  );
}
```

### Handling Errors

```typescript
// In Express routes
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await userService.findById(req.params.id);
  if (!user) {
    throw new NotFoundError('User', req.params.id);
  }
  res.json(user);
}));

// With try-catch
try {
  await processPayment(order);
} catch (err) {
  logFormattedError(err, { orderId: order.id });
  throw toBaseError(err, 'Payment processing failed');
}

// With tryCatch utility
const result = await tryCatch(
  async () => {
    return await fetchData();
  },
  'Failed to fetch data',
  { operation: 'fetchData' }
);

// With retry
const result = await executeWithRetry(
  async () => {
    return await makeApiRequest();
  },
  {
    retries: 3,
    delay: 1000,
    backoffFactor: 2
  }
);
```

## Best Practices

1. **Use appropriate error types**: Choose the most specific error class for each situation.
2. **Include meaningful details**: Add relevant context to errors to aid debugging.
3. **Preserve original errors**: Use the `cause` parameter to maintain the error chain.
4. **Handle errors at boundaries**: Catch and transform errors at system boundaries.
5. **Log with context**: Always include relevant context when logging errors.
6. **Be consistent**: Follow the patterns established in this system.

## Further Reading

For more detailed information, see the [Error Handling Guide](../../docs/ERROR_HANDLING_GUIDE.md).
