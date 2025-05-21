# Automated Test Coverage Reporting

This document explains how automated test coverage reporting is set up in our CI/CD pipeline.

## Overview

Our project uses both Vitest and Playwright for testing, and we've implemented automated coverage reporting that:

1. Runs on every pull request and push to main
2. Combines coverage data from both test frameworks
3. Displays coverage metrics directly on PRs
4. Archives coverage reports as artifacts
5. Publishes detailed reports to GitHub Pages

## Coverage Workflow

The automated coverage reporting is implemented in the following GitHub Actions workflow:

- `.github/workflows/test-coverage-with-artifacts.yml`

This workflow:

1. Sets up the test environment with PostgreSQL and Redis
2. Runs Vitest tests with coverage
3. Runs Playwright tests with coverage
4. Merges the coverage reports
5. Posts coverage metrics as a PR comment
6. Archives the coverage reports as artifacts

## Coverage Metrics

We track four main coverage metrics:

1. **Statements**: Percentage of statements executed during tests
2. **Branches**: Percentage of code branches (if/else, switch cases, etc.) executed during tests
3. **Functions**: Percentage of functions called during tests
4. **Lines**: Percentage of code lines executed during tests

## Coverage Thresholds

Our project maintains the following minimum coverage thresholds (defined in `vitest.config.ts`):

| Metric | Threshold |
|--------|-----------|
| Statements | 70% |
| Branches | 60% |
| Functions | 70% |
| Lines | 70% |

## Viewing Coverage Reports

### Pull Requests

On each PR, a comment is automatically added with:
- Current coverage metrics
- Comparison to previous coverage (if available)
- Link to the full coverage report

### Artifacts

Coverage reports are archived as artifacts in each workflow run:
1. **combined-coverage-report**: Contains the merged coverage data from all test frameworks
2. **test-results**: Contains test execution results and reports

To access artifacts:
1. Go to the Actions tab in GitHub
2. Select the workflow run
3. Scroll down to the Artifacts section
4. Download the desired artifact

## Running Coverage Locally

To generate and view coverage reports locally:

```bash
# Run Vitest tests with coverage
npm run test:coverage

# Run Playwright tests with coverage
npm run test:playwright:coverage

# Merge coverage reports
npm run test:all-coverage
```

The combined coverage report will be available in the `combined-coverage` directory.

## Implementation Details

### Vitest Coverage

Vitest is configured to use the V8 coverage provider, which generates coverage data for all JavaScript/TypeScript code executed during tests.

Configuration is in `vitest.config.ts`:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/*.d.ts',
    '**/types/**'
  ],
  reportsDirectory: './coverage',
  thresholds: {
    statements: 70,
    branches: 60,
    functions: 70,
    lines: 70
  }
}
```

### Playwright Coverage

Playwright is configured to collect coverage data during end-to-end tests.

### Merging Coverage Reports

We use the `merge-coverage-reports.js` script to combine coverage data from both test frameworks into a unified report.

## Troubleshooting

### Missing Coverage Data

If coverage data is missing for certain files:

1. Check that the files are being imported and executed during tests
2. Verify that the files are not excluded in the coverage configuration
3. Ensure that the test environment is properly set up

### Incorrect Coverage Reports

If coverage reports seem incorrect:

1. Clear the coverage cache: `rm -rf coverage/ playwright-coverage/ combined-coverage/ .nyc_output/`
2. Run the tests again with coverage enabled
3. Check that the correct files are being included in the coverage report

## Best Practices

1. **Write tests for new code**: Ensure all new code has appropriate test coverage
2. **Check coverage locally**: Run coverage reports locally before submitting PRs
3. **Focus on meaningful coverage**: Prioritize testing business logic and critical paths
4. **Don't write tests just for coverage**: Tests should verify functionality, not just increase metrics