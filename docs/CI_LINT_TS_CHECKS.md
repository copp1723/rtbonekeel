# CI Lint and TypeScript Checks

## Overview
This project enforces code quality and type safety by running ESLint and TypeScript checks in the Continuous Integration (CI) pipeline. All code changes are automatically checked for linting errors and TypeScript compilation issues.

## How It Works
The CI pipeline is defined in `.github/workflows/ci.yml` and includes dedicated steps for both ESLint and TypeScript checks:

- **Linting**: Runs `npx eslint .` to check for code style and linting errors.
- **TypeScript Check**: Runs `npx tsc --noEmit` to ensure there are no type errors.

If either of these steps fails, the CI pipeline will fail, preventing code with lint or type errors from being merged.

## Relevant CI Configuration
```
- name: Run ESLint
  run: npx eslint .

- name: Type check
  run: npx tsc --noEmit
```
These steps are found in the `lint` job of the CI workflow.

## How to Run Locally
You can run the same checks locally before pushing your code:

```sh
npm ci
npx eslint .
npx tsc --noEmit
```

## References
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## File Locations
- CI Workflow: `.github/workflows/ci.yml`
- Lint/TypeScript Docs: `docs/CI_LINT_TS_CHECKS.md`
