# Project Tools Guide

This document provides information about the tools available in the Row The Boat application, including utility scripts, development tools, and automation helpers.

## Development Tools

### Code Quality Tools

| Tool | Purpose | Configuration |
|------|---------|--------------|
| ESLint | Static code analysis | `.eslintrc.json`, `eslint.config.js` |
| TypeScript | Type checking | `tsconfig.json`, `tsconfig.strict.json` |
| Prettier | Code formatting | Integrated with ESLint |
| Husky | Git hooks | `.husky/` directory |
| Commitlint | Commit message linting | Uses conventional commit format |

### Testing Tools

| Tool | Purpose | Configuration |
|------|---------|--------------|
| Vitest | Test runner | `vitest.config.ts` |
| Supertest | API testing | Used in integration tests |
| Codecov | Coverage reporting | Integrated with GitHub Actions |

### Build Tools

| Tool | Purpose | Configuration |
|------|---------|--------------|
| TypeScript Compiler | Transpilation | `tsconfig.json` |
| Build Script | Build automation | `build.sh` |

## Utility Scripts

### Code Maintenance Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `check-types.sh` | Run TypeScript type checking | `./check-types.sh` |
| `track-ts-errors.sh` | Track TypeScript errors | `./track-ts-errors.sh` |
| `fix-typescript-errors.sh` | Fix common TypeScript errors | `./fix-typescript-errors.sh` |
| `enforce-canonical-exports.sh` | Verify export patterns | `./enforce-canonical-exports.sh` |
| `add-barrel-exports.sh` | Generate barrel files | `./add-barrel-exports.sh [directory]` |
| `fix-imports.sh` | Fix import statements | `./fix-imports.sh` |

### Database Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `npm run migrate` | Run database migrations | `npm run migrate` |
| `fix-db-logger.sh` | Fix database logging issues | `./fix-db-logger.sh` |

### Security Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `fix-security-vulnerabilities.sh` | Fix security issues | `./fix-security-vulnerabilities.sh` |
| `security-hardening.sh` | Apply security hardening | `./security-hardening.sh` |

## CI/CD Tools

### GitHub Actions Workflows

| Workflow | Purpose | Trigger |
|----------|---------|---------|
| `ci.yml` | Main CI pipeline | Push to main, PRs |
| `test-coverage.yml` | Test coverage reporting | Push to main, PRs |
| `pr-coverage-comment.yml` | PR coverage comments | PRs |
| `coverage-report.yml` | Generate coverage reports | Push to main |
| `lint-and-ts-check.yml` | Linting and type checking | Push to main, PRs |
| `ts-error-tracking.yml` | Track TypeScript errors | Push to main |

## Code Generation Tools

### Type Generation

| Tool | Purpose | Usage |
|------|---------|-------|
| `drizzle-kit` | Generate database types | Part of `npm run migrate` |
| `create-stubs.sh` | Generate test stubs | `./create-stubs.sh [module]` |

## Analysis Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| `generate-type-issues.sh` | Generate type issue report | `./generate-type-issues.sh` |
| `esm-import-audit.js` | Audit ESM imports | `node esm-import-audit.js` |
| `jscpd` | Detect code duplication | Via npm scripts |

## Ingestion API Tools

The project includes several tools for working with the data ingestion APIs:

### Email Ingestion

Tools for processing incoming emails:

- `src/tools/email-processor.ts`: Processes incoming emails
- `src/tools/attachment-extractor.ts`: Extracts and processes email attachments
- `src/tools/email-parser.ts`: Parses email content

### File Ingestion

Tools for processing uploaded files:

- `src/tools/file-processor.ts`: Processes uploaded files
- `src/tools/csv-parser.ts`: Parses CSV files
- `src/tools/excel-parser.ts`: Parses Excel files
- `src/tools/pdf-parser.ts`: Extracts data from PDF files

### API Ingestion

Tools for ingesting data from external APIs:

- `src/tools/api-client.ts`: Base client for API connections
- `src/tools/webhook-processor.ts`: Processes incoming webhooks
- `src/tools/api-poller.ts`: Polls external APIs for data

## Monitoring and Debugging Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| Pino | Logging | Configured in `src/shared/logger.ts` |
| Sentry | Error tracking | Configured in `src/shared/sentry.ts` |
| Datadog | Metrics | Configured in `src/shared/metrics.ts` |

## Documentation Tools

| Tool | Purpose | Location |
|------|---------|----------|
| Markdown | Documentation | `docs/` directory |
| OpenAPI | API documentation | `docs/openapi/` directory |

## Using the Tools

### Running Type Checks

```bash
# Run type checking
npm run type-check

# Track TypeScript errors
npm run track-ts-errors
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Running Linting

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix
```

### Building the Project

```bash
# Build the project
npm run build
```

## Best Practices

1. **Use the provided tools**: Don't reinvent the wheel
2. **Keep tools updated**: Regularly update dependencies
3. **Document tool usage**: Add comments and documentation
4. **Automate repetitive tasks**: Create scripts for common operations
5. **Use Git hooks**: Leverage Husky for pre-commit checks

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Type errors | Run `./fix-typescript-errors.sh` |
| Import errors | Run `./fix-imports.sh` |
| Build failures | Check the build log and fix reported issues |
| Test failures | Run tests locally with `npm test` to debug |

### Getting Help

If you encounter issues with any tools:

1. Check the tool's documentation
2. Look for similar issues in the project's issue tracker
3. Ask for help in the development chat
4. Consult the tool's official documentation