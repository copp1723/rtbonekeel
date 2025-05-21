# Code Coverage Guide

This document explains how code coverage is measured, reported, and maintained in the project.

## Overview

Code coverage is a metric that helps us understand how much of our codebase is being tested. We use [Vitest](https://vitest.dev/) with the V8 coverage provider to generate coverage reports.

## Coverage Metrics

We track four main coverage metrics:

1. **Statements**: Percentage of statements executed during tests
2. **Branches**: Percentage of code branches (if/else, switch cases, etc.) executed during tests
3. **Functions**: Percentage of functions called during tests
4. **Lines**: Percentage of code lines executed during tests

## Coverage Thresholds

Our project maintains the following minimum coverage thresholds:

| Metric | Threshold |
|--------|-----------|
| Statements | 70% |
| Branches | 60% |
| Functions | 70% |
| Lines | 70% |

These thresholds are defined in `vitest.config.ts` and are enforced during CI builds.

## Viewing Coverage Reports

### Local Development

To generate a coverage report locally:

```bash
npm run test:coverage
```

This will create a coverage report in the `coverage/` directory. You can open `coverage/html/index.html` in a browser to view the detailed report.

### CI/CD Pipeline

Coverage reports are automatically generated in our CI/CD pipeline:

1. **Pull Requests**: Each PR includes a comment with the current coverage metrics and a comparison to the thresholds.
2. **Main Branch**: Coverage reports are generated and published to GitHub Pages after each push to the main branch.
3. **Coverage Badge**: The README includes a coverage badge that shows the current line coverage percentage.

### GitHub Pages Report

A detailed coverage report is available on GitHub Pages at:
`https://[organization].github.io/[repository]/coverage-report/`

This report is updated after each push to the main branch.

## Improving Coverage

When adding new code or modifying existing code, follow these guidelines to maintain or improve coverage:

1. **Write tests first**: Follow test-driven development (TDD) principles when possible.
2. **Test edge cases**: Ensure your tests cover error conditions and edge cases.
3. **Check coverage locally**: Run `npm run test:coverage` before submitting a PR to identify untested code.
4. **Focus on critical paths**: Prioritize testing business-critical functionality.

## Excluding Files from Coverage

Some files may be excluded from coverage calculations if they fall into these categories:

1. Configuration files
2. Type definition files
3. Test utilities
4. Generated code

To exclude files, update the `exclude` section in the `coverage` configuration in `vitest.config.ts`.

## Coverage in CI/CD

Our CI/CD pipeline includes several coverage-related workflows:

1. **test-coverage.yml**: Runs on every push to main and PR, generating basic coverage metrics
2. **pr-coverage-comment.yml**: Adds detailed coverage information as a comment on PRs
3. **coverage-report.yml**: Generates and publishes a detailed coverage report to GitHub Pages

## Troubleshooting

### Missing Coverage for Async Code

If you notice that async code isn't being properly covered:

1. Ensure you're using `await` when testing async functions
2. Check that promises are being resolved in your tests
3. Use `vi.waitFor()` for code that depends on timers or events

### Incorrect Coverage Reports

If coverage reports seem incorrect:

1. Clear the coverage cache: `rm -rf coverage/`
2. Ensure you're not using `// @ts-ignore` or similar comments to bypass type checking
3. Check that your test files are properly included in the test configuration

## Best Practices

1. **Don't write tests just for coverage**: Focus on testing behavior, not implementation details
2. **Maintain coverage when refactoring**: Ensure tests still provide adequate coverage after code changes
3. **Review coverage reports**: Regularly check coverage reports to identify areas needing more tests
4. **Set realistic thresholds**: Adjust coverage thresholds based on project maturity and criticality