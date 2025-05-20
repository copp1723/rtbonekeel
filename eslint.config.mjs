// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  // Configuration for TypeScript files
  {
    files: ["**/*.ts", "**/*.tsx"], // Only apply type-aware linting to TS/TSX files
    extends: [...tseslint.configs.recommendedTypeChecked],
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
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-undef": "error",
    },
  },
  // Configuration for JS files (including eslint.config.mjs itself)
  {
    files: ["**/*.js", "**/*.mjs"],
    rules: {
      // Add any JS-specific rules here if needed
      // For now, ensure type-aware rules are not applied
    },
    languageOptions: {
      globals: {
        ...globals.node, // eslint.config.mjs uses node globals like `import.meta.dirname`
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
      // "eslint.config.mjs", // No longer needed here as it's handled by the JS/MJS specific config
    ]
  }
);
