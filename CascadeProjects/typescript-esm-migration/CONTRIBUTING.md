# Contributing Guide

## Testing

### Running Tests

To run all tests:
```bash
npm test
```

To run tests with coverage:
```bash
npm test -- --coverage
```

### Integration Tests
To run integration tests:
```bash
npm run test:integration
```

### Fixing Failing Tests
1. Check the CI logs to identify which tests are failing
2. Run the failing tests locally:
```bash
npm test -- <path-to-test-file>
```
3. Minimum coverage requirements:
   - Statements: 60%
   - Branches: 50%
   - Functions: 60%
   - Lines: 60%

## CI Requirements
- All tests must pass
- Coverage must meet minimum thresholds
- PRs with new uncovered lines may be rejected
