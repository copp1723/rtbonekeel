# Development Workflows Guide

This document outlines the key workflows for developing, testing, and deploying the Row The Boat application.

## Development Workflow

### Local Development

1. **Start the development environment**

   ```bash
   # Start the backend server
   npm run dev
   
   # In a separate terminal, start the frontend
   cd frontend
   npm run dev
   ```

2. **Make changes**

   - Edit code in your preferred editor
   - Changes to the backend will trigger automatic restart
   - Changes to the frontend will trigger hot reloading

3. **Test your changes**

   ```bash
   # Run tests for the specific component you modified
   npm test -- path/to/your/test
   
   # Or run all tests
   npm test
   ```

4. **Commit your changes**

   ```bash
   # Stage your changes
   git add .
   
   # Commit using conventional commits
   npm run commit
   # Or manually: git commit -m "feat: add new feature"
   ```

### Feature Branch Workflow

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Develop and test your feature**

   - Follow the local development workflow
   - Ensure all tests pass
   - Add new tests as needed

3. **Push your branch**

   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a pull request**

   - Go to GitHub and create a PR
   - Fill out the PR template
   - Request reviews from team members

5. **Address review feedback**

   - Make requested changes
   - Push additional commits
   - Respond to comments

6. **Merge the PR**

   - Once approved, merge the PR
   - Delete the feature branch

## Testing Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode during development
npm run test:watch
```

### Writing Tests

1. **Create test files**

   - Unit tests: `*.test.ts` in `tests/unit/` or alongside the code
   - Integration tests: `*.spec.ts` in `tests/integration/`
   - E2E tests: `*.spec.ts` in `tests/e2e/`

2. **Follow the test structure**

   ```typescript
   import { describe, it, expect } from 'vitest';
   
   describe('Module or function name', () => {
     it('should do something specific', () => {
       // Arrange
       const input = 'test';
       
       // Act
       const result = functionToTest(input);
       
       // Assert
       expect(result).toBe(expectedOutput);
     });
   });
   ```

3. **Run tests to verify**

   ```bash
   npm test -- path/to/your/test
   ```

## Code Review Workflow

### Submitting Code for Review

1. **Ensure your code is ready**

   - All tests pass
   - Linting passes
   - Type checking passes
   - Code is well-documented

2. **Create a pull request**

   - Use a clear title that describes the change
   - Fill out the PR template
   - Link to any related issues

3. **Request reviews**

   - Assign reviewers based on code ownership
   - Tag relevant team members

### Reviewing Code

1. **Review the PR description**

   - Understand the purpose of the changes
   - Check for linked issues

2. **Review the code changes**

   - Check for adherence to coding standards
   - Verify functionality
   - Look for potential bugs or edge cases
   - Consider performance implications

3. **Run the code locally if needed**

   ```bash
   git fetch origin
   git checkout feature/branch-name
   npm install
   npm test
   ```

4. **Provide feedback**

   - Use GitHub's review features
   - Be specific and constructive
   - Distinguish between required changes and suggestions

5. **Approve or request changes**

   - Approve if the code is ready to merge
   - Request changes if issues need to be addressed

## Deployment Workflow

### Staging Deployment

1. **Merge to staging branch**

   ```bash
   git checkout staging
   git merge main
   git push origin staging
   ```

2. **CI/CD pipeline**

   - Automated tests run
   - Build is created
   - Deployment to staging environment

3. **Verify staging deployment**

   - Run smoke tests
   - Check for any issues
   - Verify new functionality

### Production Deployment

1. **Create a release branch**

   ```bash
   git checkout -b release/v1.2.3 main
   git push origin release/v1.2.3
   ```

2. **Create a release PR**

   - PR from release branch to production branch
   - Include release notes
   - Request reviews

3. **Merge to production**

   - After approval, merge the PR
   - CI/CD pipeline deploys to production

4. **Tag the release**

   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```

5. **Monitor the deployment**

   - Watch logs for errors
   - Monitor performance metrics
   - Check user feedback

## Bug Fix Workflow

### Handling Critical Bugs

1. **Create a hotfix branch**

   ```bash
   git checkout -b hotfix/bug-description production
   ```

2. **Fix the bug**

   - Make minimal changes to address the issue
   - Add tests to prevent regression

3. **Test thoroughly**

   ```bash
   npm test
   ```

4. **Create a hotfix PR**

   - PR to production branch
   - Include detailed description of the fix

5. **Deploy the hotfix**

   - After approval, merge and deploy
   - Tag the hotfix release

6. **Backport to main**

   - Create a PR to merge the fix into main

### Handling Non-Critical Bugs

1. **Create an issue**

   - Describe the bug in detail
   - Include steps to reproduce
   - Add severity label

2. **Create a bugfix branch**

   ```bash
   git checkout -b fix/bug-description main
   ```

3. **Fix the bug**

   - Implement the fix
   - Add tests

4. **Follow standard PR process**

   - Create a PR to main
   - Get reviews and merge

## Documentation Workflow

### Updating Documentation

1. **Identify documentation needs**

   - New features require documentation
   - Changes to existing features may require updates
   - User-reported confusion indicates documentation gaps
   - API changes must be reflected in OpenAPI specifications
   - Error handling changes must be documented in ERROR_HANDLING.md

2. **Update relevant files**

   - Update files in the `docs/` directory
   - Update inline documentation (JSDoc comments)
   - Update README if needed
   - Update OpenAPI specifications in `docs/openapi/`
   - Update error codes in `src/utils/errors.ts` and ERROR_HANDLING.md

3. **Validate documentation**

   - Ensure OpenAPI specifications are valid
   ```bash
   npm run validate-openapi
   ```
   - Check for broken links in markdown files
   ```bash
   npm run check-docs-links
   ```
   - Verify code examples are up-to-date and working

4. **Review documentation changes**

   - Have team members review for clarity
   - Check for technical accuracy
   - Ensure consistency with existing documentation
   - Verify that all canonical patterns are correctly documented

5. **Commit documentation changes**

   ```bash
   git commit -m "docs: update documentation for feature X"
   ```

6. **Update documentation index**

   - Ensure new documentation is linked from relevant index pages
   - Update the documentation search index if applicable

### Creating New Documentation

1. **Create new markdown files**

   - Place in the appropriate location in `docs/`
   - Follow the established format

2. **Link from existing documentation**

   - Add links from related documents
   - Update the documentation index if one exists

3. **Submit for review**

   - Include documentation in feature PRs
   - Or create separate documentation PRs

## Release Workflow

### Planning a Release

1. **Define release scope**

   - Identify features and fixes to include
   - Set release date

2. **Create release milestone**

   - Add issues and PRs to the milestone
   - Track progress

3. **Freeze features**

   - Stop merging new features before release
   - Focus on bug fixes and stability

### Executing a Release

1. **Create release branch**

   ```bash
   git checkout -b release/v1.2.3 main
   ```

2. **Finalize version**

   - Update version in package.json
   - Update CHANGELOG.md

3. **Create release PR**

   - PR from release branch to production
   - Include release notes

4. **Deploy to production**

   - After approval, merge and deploy

5. **Tag the release**

   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```

6. **Create GitHub release**

   - Use the tag
   - Include release notes

## Continuous Integration Workflow

### CI Pipeline Stages

1. **Lint and Type Check**

   - ESLint runs on all code
   - TypeScript type checking runs
   - Canonical export pattern validation runs
   - Code formatting check runs

2. **Unit and Integration Tests**

   - All tests run
   - Coverage report generated
   - Coverage thresholds enforced (minimum 80%)
   - Performance benchmarks run

3. **Security Checks**

   - Dependency vulnerability scanning
   - Static code analysis for security issues
   - Secret detection
   - License compliance check

4. **Build**

   - Application is built
   - Build artifacts are created
   - Docker images are built and tagged

5. **Documentation**

   - API documentation is generated
   - OpenAPI specifications are validated
   - Documentation links are checked

6. **Deploy (if on main/staging/production)**

   - Application is deployed to the appropriate environment
   - Smoke tests run after deployment
   - Performance monitoring is configured

### Handling CI Failures

1. **Check the CI logs**

   - Identify the failing step
   - Look for error messages

2. **Fix locally**

   - Reproduce the issue locally
   - Make necessary changes

3. **Push fixes**

   - Commit and push fixes
   - CI will run again

4. **Verify success**

   - Ensure all CI checks pass