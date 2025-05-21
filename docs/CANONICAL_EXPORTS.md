# Canonical Exports Guide

This document provides comprehensive information about the canonical exports pattern used in the Row The Boat application.

## Overview

Canonical exports are the standardized way we export functionality from our modules. This approach ensures consistency, improves maintainability, and makes imports more predictable across the codebase.

## Key Principles

1. **Named exports over default exports**: We use named exports to improve static analysis and refactoring capabilities.
2. **Barrel files**: We use index files (barrel files) to re-export functionality from a directory.
3. **Explicit exports**: All exports should be explicitly defined in the barrel file.
4. **No re-exports from dependencies**: Avoid re-exporting third-party dependencies.
5. **Type exports**: Export types alongside their related functionality.
6. **Consistent naming**: Use consistent naming conventions for exports.
7. **Minimal public API**: Only export what's needed by other modules.
8. **ESM compatibility**: Ensure exports are compatible with ESM imports.

## Directory Structure

Each module should follow this structure:

```
module/
├── index.ts         # Barrel file with all exports
├── submodule1/
│   ├── index.ts     # Submodule barrel file
│   └── ...          # Implementation files
├── submodule2/
│   ├── index.ts     # Submodule barrel file
│   └── ...          # Implementation files
└── ...              # Other implementation files
```

## Barrel File Example

A typical barrel file (`index.ts`) should look like this:

```typescript
// Re-export from submodules
export * from './submodule1';
export * from './submodule2';

// Export from local files
export * from './types';
export * from './constants';
export * from './utils';

// Named exports from implementation files
export { functionA, functionB } from './implementation';
export { ClassA, ClassB } from './classes';
```

## Import Examples

### Recommended

```typescript
// Import from the module's barrel file
import { functionA, ClassA } from '@/module';

// Import from a specific submodule
import { specificFunction } from '@/module/submodule1';
```

### Not Recommended

```typescript
// Avoid importing directly from implementation files
import { functionA } from '@/module/implementation';

// Avoid importing everything
import * as Module from '@/module';
```

## Tools and Enforcement

We have several tools to help maintain canonical exports:

1. **enforce-canonical-exports.sh**: Script that checks if all exports follow the canonical pattern
2. **add-barrel-exports.sh**: Script that helps generate barrel files for directories
3. **ESLint rules**: We use ESLint to enforce import/export patterns

## Common Modules and Their Exports

### Core Module

```typescript
// @/core/index.ts
export { initializeApp, shutdownApp } from './lifecycle';
export { AppConfig, loadConfig } from './config';
export { registerService, getService } from './service-registry';
```

### API Module

```typescript
// @/api/index.ts
export { createRouter } from './router';
export { authenticate, authorize } from './auth';
export { validateRequest, sanitizeResponse } from './middleware';
export * from './endpoints';
```

### Services Module

```typescript
// @/services/index.ts
export { UserService } from './user';
export { EmailService } from './email';
export { StorageService } from './storage';
export { AnalyticsService } from './analytics';
```

### Utils Module

```typescript
// @/utils/index.ts
export { formatDate, parseDate } from './date';
export { encrypt, decrypt } from './crypto';
export { validateEmail, validatePhone } from './validation';
export * from './formatting';
```

## Adding New Exports

When adding new functionality:

1. Create your implementation file(s)
2. Export the functionality from the appropriate barrel file
3. Run `npm run enforce-canonical-exports` to verify exports
4. Update documentation if adding significant new features

## Migrating Non-Canonical Exports

If you encounter non-canonical exports:

1. Move the exports to the appropriate barrel file
2. Update imports across the codebase
3. Add deprecation warnings for direct imports if needed
4. Run tests to ensure functionality is preserved

## Best Practices

1. **Keep barrel files organized**: Group related exports together
2. **Avoid circular dependencies**: Structure your modules to prevent circular imports
3. **Be explicit**: Use named exports to make dependencies clear
4. **Document public APIs**: Add JSDoc comments to exported functions and classes
5. **Limit export scope**: Only export what's needed by other modules
6. **Use type exports**: Use `export type` for type-only exports
7. **Consistent file naming**: Name files according to their primary export
8. **Test exports**: Write tests that verify the public API works as expected
9. **Version exports carefully**: Consider backward compatibility when changing exports
10. **Use path aliases**: Use the `@/` path alias for imports from the src directory
11. **Avoid deep imports**: Import from the highest-level barrel file that exports what you need
12. **Document breaking changes**: Clearly document any breaking changes to exports

## Common Issues and Solutions

### Circular Dependencies

If you encounter circular dependencies:

1. Extract the shared functionality to a separate module
2. Use dependency injection to break the cycle
3. Consider if the circular dependency indicates a design issue

### Import Path Confusion

If you're unsure which import path to use:

1. Always prefer importing from the highest-level barrel file that exports what you need
2. Use the `@/` path alias for imports from the src directory
3. Consult the module's documentation for recommended import patterns

### Type Exports

For type exports:

1. Export types alongside their related functionality
2. Use `export type` for type-only exports
3. Consider creating a separate `types.ts` file for complex type definitions