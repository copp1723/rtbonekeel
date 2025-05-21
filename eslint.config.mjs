// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  // Configuration for TypeScript files
  {
    files: ["**/*.ts", "**/*.tsx"], // Only apply type-aware linting to TS/TSX files
    extends: [...tseslint.configs.recommendedTypeChecked, ...tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.eslint.json", // Use the new tsconfig for ESLint
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.es2021,
      }
    },
    rules: {
      // Error level rules for strict type safety
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/explicit-function-return-type": ["error", {
        "allowExpressions": true,
        "allowTypedFunctionExpressions": true,
        "allowHigherOrderFunctions": true
      }],
      "@typescript-eslint/consistent-type-imports": ["error", {
        "prefer": "type-imports",
        "disallowTypeAnnotations": false
      }],
      "@typescript-eslint/consistent-type-exports": ["error", {
        "fixMixedExportsWithInlineTypeSpecifier": true
      }],
      "no-undef": "error",
      
      // Security-related rules
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-param-reassign": "error",
      "no-return-assign": "error",
      "no-script-url": "error",
      "no-useless-escape": "error"
    },
  },
  // Configuration for JS files (including eslint.config.mjs itself)
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    rules: {
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-param-reassign": "error",
      "no-return-assign": "error",
      "no-script-url": "error",
      "no-useless-escape": "error"
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      }
    }
  },
  // Global ignores
  {
    ignores: [
      "dist/",
      "node_modules/",
      "node_modules_old/",
      "coverage/",
      "frontend/",
      "**/*.d.ts",
    ]
  }
);
