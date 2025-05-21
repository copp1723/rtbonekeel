# Test Fixtures Directory

This directory contains test fixtures used for end-to-end (E2E) and integration testing.

## Purpose

Test fixtures provide consistent, realistic test data that can be used across different test suites. They help ensure that tests are:

- Reproducible
- Isolated from production data
- Representative of real-world scenarios
- Consistent across test runs

## Available Fixtures

### Sample Data Sets

- `users.json` - Sample user data for testing user workflows
- `reports.json` - Sample report data for testing report generation
- `emails.json` - Sample email data for testing email ingestion

### Edge Case Data

- `malformed-data.json` - Intentionally malformed data for testing error handling
- `large-payload.json` - Large dataset for testing performance and limits
- `missing-fields.json` - Data with missing required fields for validation testing

## Usage

Import fixtures in your tests:

```typescript
import { readFixture } from '../helpers/test-utils';

// In your test
const userData = await readFixture('users.json');
```

## Adding New Fixtures

When adding new fixtures:

1. Use realistic but sanitized data (no PII)
2. Document the fixture's purpose in this README
3. Keep fixture files small and focused
4. Use descriptive filenames

## Database Reset Scripts

For database testing, use the utility functions in `../helpers/db-test-utils.ts`:

```typescript
import { createTestDb, cleanupTestDb } from '../helpers/db-test-utils';

// In your test setup
const { client, db, schemaName } = await createTestDb();

// In your test teardown
await cleanupTestDb(client, schemaName);
```

## Sentry and Coverage Configuration

Sentry error tracking and coverage reporting are configured to work in the test environment. See `.env.test` for configuration details.