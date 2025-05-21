# TypeScript Error Reduction and Strictness Enhancement

This project aims to reduce TypeScript errors and gradually strengthen TypeScript strictness in targeted modules.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the TypeScript compiler: `npx tsc --noEmit`

## Scripts

### Track TypeScript Errors

```bash
./track-ts-errors.sh
```

This script runs the TypeScript compiler in noEmit mode and saves the errors to a file. It also creates a summary file with categorized errors.

### Apply Strict Mode to a Module

```bash
./scripts/apply-strict-mode.sh <module-path>
```

This script applies strict TypeScript settings to a specific module and checks for errors.

### Fix Common TypeScript Errors

```bash
./scripts/fix-common-ts-errors.sh <module-path>
```

This script automatically fixes common TypeScript errors in a specific module.

## TypeScript Configuration

### Base Configuration

The base TypeScript configuration is defined in `tsconfig.json`.

### Strict Configuration

A stricter TypeScript configuration is defined in `tsconfig.strict.json`. This configuration extends the base configuration and applies more strict rules.

## Type Declarations

Global type declarations are defined in `src/types/index.d.ts`. This file provides type definitions for common modules and functions used throughout the project.

## Error Reduction Plan

See [ts-error-reduction-plan.md](scripts/ts-error-reduction-plan.md) for a comprehensive plan to reduce TypeScript errors and strengthen TypeScript strictness.