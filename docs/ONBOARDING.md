# Developer Onboarding Guide

Welcome to the Row The Boat project! This guide will help you get started as a developer on the project.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or later)
- npm (v8 or later)
- PostgreSQL (v14 or later)
- Redis (v6 or later)
- Git
- Docker (optional, for containerized development)

### Setting Up Your Development Environment

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/rtbonekeel.git
   cd rtbonekeel
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Set up the database**

   ```bash
   # Start PostgreSQL if not running
   # Create a database for the project
   createdb rtbonekeel_dev
   
   # Run migrations
   npm run migrate
   ```

5. **Set up Git hooks**

   ```bash
   # Husky will be installed automatically with npm install
   # This sets up pre-commit hooks for linting and type checking
   ```

6. **Start the development server**

   ```bash
   npm run dev
   ```

## Project Structure

The project follows a modular structure:

```
rtbonekeel/
├── .github/            # GitHub Actions workflows
├── configs/            # Configuration files
├── docs/               # Documentation
├── frontend/           # Frontend code (Next.js)
├── scripts/            # Utility scripts
├── src/                # Backend source code
│   ├── agent/          # Agent-related code
│   ├── api/            # API endpoints
│   ├── config/         # Configuration loading
│   ├── core/           # Core functionality
│   ├── errors/         # Error handling
│   ├── features/       # Feature modules
│   ├── middleware/     # Express middleware
│   ├── migrations/     # Database migrations
│   ├── parsers/        # Data parsers
│   ├── prompts/        # AI prompt templates
│   ├── server/         # Server setup
│   ├── services/       # Business logic services
│   ├── shared/         # Shared utilities
│   ├── tests/          # Tests within source
│   ├── tools/          # Developer tools
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── tests/              # Test files
│   ├── e2e/            # End-to-end tests
│   ├── integration/    # Integration tests
│   └── unit/           # Unit tests
└── type-issues/        # TypeScript issue tracking
```

## Key Concepts

### Canonical Exports

We use a canonical exports pattern to standardize how modules export their functionality. See [CANONICAL_EXPORTS.md](./CANONICAL_EXPORTS.md) for details. All new code must follow this pattern to ensure consistency across the codebase.

### API Structure

The API follows a RESTful design with versioned endpoints. Controllers handle request processing, services contain business logic, and repositories manage data access. For API ingestion capabilities, see [API_INGESTION.md](./API_INGESTION.md).

### Testing Strategy

We use a comprehensive testing approach with unit, integration, and end-to-end tests. See [TESTING.md](./TESTING.md) for details. We use Vitest for unit and integration tests, and Playwright for end-to-end tests.

### Error Handling

The application uses a centralized error handling system with typed error classes. All errors should extend from our base error classes. See [ERROR_HANDLING.md](./ERROR_HANDLING.md) for details on implementing proper error handling.

### Logging

We use Pino for structured logging with standardized log levels and formats. All logs should include appropriate context data. See [LOGGING_STANDARDS.md](./LOGGING_STANDARDS.md) for details.

## Development Workflow

### Feature Development

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Implement your changes**

   Follow the coding standards and patterns established in the project. Ensure you adhere to:
   - Canonical export patterns
   - Proper error handling using typed error classes
   - Consistent logging practices
   - Type safety (minimize use of `any` and `unknown` types)

3. **Write tests**

   Add tests for your changes to maintain or improve code coverage. Aim for:
   - Unit tests for individual functions and classes
   - Integration tests for service interactions
   - End-to-end tests for critical user flows

4. **Run linting and type checking**

   ```bash
   npm run lint
   npm run type-check
   ```

   Fix any TypeScript errors using the provided scripts:
   ```bash
   ./fix-typescript-errors.sh
   ```

5. **Run tests**

   ```bash
   npm test
   ```

   For specific test types:
   ```bash
   npm run test:unit
   npm run test:integration
   npm run test:e2e
   ```

6. **Commit your changes**

   We use conventional commits:

   ```bash
   # The project is set up with commitizen
   npm run commit
   
   # Or manually
   git commit -m "feat: add new feature"
   ```

7. **Create a pull request**

   Push your branch and create a PR on GitHub. Use the PR template and ensure you've addressed all the checklist items.

### Code Review Process

1. All PRs require at least one review
2. CI checks must pass (linting, type checking, tests)
3. Code coverage should not decrease
4. Follow the feedback from reviewers

## Tools and Utilities

### Available Scripts

- `npm run dev`: Start the development server
- `npm test`: Run all tests
- `npm run test:unit`: Run unit tests
- `npm run test:integration`: Run integration tests
- `npm run test:e2e`: Run end-to-end tests
- `npm run test:coverage`: Generate test coverage report
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix ESLint issues
- `npm run type-check`: Run TypeScript type checking
- `npm run build`: Build the project
- `npm start`: Start the production server

### Utility Scripts

The project includes several utility scripts in the root directory:

- `check-types.sh`: Run TypeScript type checking
- `track-ts-errors.sh`: Track TypeScript errors
- `enforce-canonical-exports.sh`: Check for canonical exports
- `fix-typescript-errors.sh`: Fix common TypeScript errors

See [TOOLS.md](./TOOLS.md) for a complete list of available tools.

## Documentation

The project includes comprehensive documentation in the `docs/` directory:

- [API.md](./API.md): API documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md): System architecture
- [CANONICAL_EXPORTS.md](./CANONICAL_EXPORTS.md): Export patterns
- [CODE_COVERAGE.md](./CODE_COVERAGE.md): Code coverage guide
- [CONFIGURATION.md](./CONFIGURATION.md): Configuration guide
- [ERROR_HANDLING.md](./ERROR_HANDLING.md): Error handling
- [LOGGING_STANDARDS.md](./LOGGING_STANDARDS.md): Logging standards
- [TESTING.md](./TESTING.md): Testing guide
- [TOOLS.md](./TOOLS.md): Available tools

## Getting Help

If you need help:

1. Check the documentation in the `docs/` directory
2. Ask questions in the team chat
3. Reach out to the tech lead or senior developers

## Common Issues and Solutions

### TypeScript Errors

If you encounter TypeScript errors:

1. Run `./check-types.sh` to see all errors
2. Use `./fix-typescript-errors.sh` to fix common errors
3. Consult [TYPE_SAFETY_POLICY.md](./TYPE_SAFETY_POLICY.md) for guidance

### Build Issues

If the build fails:

1. Check for TypeScript errors
2. Ensure all dependencies are installed
3. Check for ESLint errors

### Test Failures

If tests fail:

1. Run the specific failing test for more details
2. Check for environment issues (database, Redis)
3. Verify that your changes don't break existing functionality

## Best Practices

1. **Follow the established patterns**: Use the patterns and practices already in the codebase, especially canonical exports
2. **Write tests**: Maintain or improve code coverage (aim for at least 80% coverage)
3. **Document your code**: Add JSDoc comments to functions and classes with parameter and return type descriptions
4. **Keep PRs focused**: Each PR should address a single concern and be limited to 500 lines of code when possible
5. **Use typed interfaces**: Leverage TypeScript for type safety and avoid using `any` type
6. **Follow security best practices**: See [SECURE_DEVELOPMENT.md](./SECURE_DEVELOPMENT.md)
7. **Implement proper error handling**: Use the appropriate error classes from our error hierarchy
8. **Use structured logging**: Include context data in all log messages
9. **Follow API design guidelines**: Maintain consistency in API endpoints and responses
10. **Optimize database queries**: Use indexes and limit result sets for performance

## Next Steps

Now that you're set up, here are some good first tasks:

1. Explore the codebase to understand the structure
2. Run the tests to see how the system works
3. Review the documentation to understand the design principles
4. Pick up a small task or bug fix to get familiar with the workflow

Welcome to the team!