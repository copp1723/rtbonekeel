# Canonical Export Implementation Plan

This document outlines the plan for implementing the canonical export/import pattern across the codebase.

## Current Status

Based on the analysis of the codebase, we have identified several issues:

1. **Missing .js Extensions**: Several files are missing `.js` extensions in their imports
2. **Default Exports**: Many files are using default exports instead of named exports
3. **Missing Barrel Exports**: Many directories don't have index.ts files for barrel exports

## Implementation Plan

### Phase 1: Documentation and Tools (Completed)

- ✅ Created documentation in `docs/CANONICAL_EXPORTS.md`
- ✅ Created utility module in `src/utils/canonicalExports.ts`
- ✅ Created enforcement script `enforce-canonical-exports.sh`

### Phase 2: Refactor Experimental Tools (Completed)

- ✅ Refactored `extractCleanContent.ts` to follow canonical pattern
- ✅ Refactored `summarizeText.ts` to follow canonical pattern
- ✅ Created barrel export in `src/tools/index.ts`
- ✅ Added documentation in `src/tools/README.md`

### Phase 3: Gradual Implementation (Future Work)

1. **Fix Missing .js Extensions**:
   - Update all import statements to include `.js` extensions
   - Use the `fix-esm-imports.sh` script as a starting point

2. **Replace Default Exports**:
   - Convert default exports to named exports
   - Update corresponding import statements

3. **Add Barrel Exports**:
   - Create index.ts files in all directories
   - Use consistent re-export patterns

### Phase 4: Enforcement (Future Work)

1. **Update ESLint Configuration**:
   - Add rules to enforce canonical patterns
   - Configure pre-commit hooks

2. **CI/CD Integration**:
   - Add checks in CI pipeline
   - Block merges that don't follow the pattern

## Recommendations

1. **Prioritize High-Impact Areas**:
   - Focus on shared utilities first
   - Then move to core services
   - Finally address feature-specific code

2. **Incremental Approach**:
   - Make changes in small, focused PRs
   - Test thoroughly after each change

3. **Developer Education**:
   - Share documentation with all developers
   - Conduct a brief training session

## Conclusion

By implementing the canonical export/import pattern, we will improve code consistency, maintainability, and compatibility with ESM. The refactoring of experimental tools serves as a proof of concept for this approach.