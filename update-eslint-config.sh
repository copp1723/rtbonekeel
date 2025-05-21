#!/bin/bash
set -e

echo "Updating ESLint configuration to enforce canonical patterns..."

# Install required ESLint plugins if not already installed
npm install --save-dev eslint-plugin-import

# Update ESLint configuration
cat > .eslintrc.json << 'EOF'
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "project": ["./tsconfig.json", "./frontend/tsconfig.json"]
  },
  "plugins": ["@typescript-eslint", "import"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript"
  ],
  "rules": {
    // Forbid any usage
    "@typescript-eslint/no-explicit-any": ["error", {
      "ignoreRestArgs": false,
      "fixToUnknown": false
    }],
    
    // Ban ts-ignore comments
    "@typescript-eslint/ban-ts-comment": ["error", {
      "ts-ignore": {
        "descriptionFormat": "^TS-IGNORE: \\[EXCEPTION-\\d+\\] .+$"
      },
      "ts-nocheck": true,
      "ts-check": false
    }],
    
    // Enforce explicit return types on functions and class methods
    "@typescript-eslint/explicit-function-return-type": ["error", {
      "allowExpressions": true,
      "allowTypedFunctionExpressions": true,
      "allowHigherOrderFunctions": true
    }],
    
    // Disallow usage of the any type
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    
    // Enforce consistent type assertions
    "@typescript-eslint/consistent-type-assertions": ["error", {
      "assertionStyle": "as",
      "objectLiteralTypeAssertions": "never"
    }],
    
    // Enforce naming conventions
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "default",
        "format": ["camelCase"]
      },
      {
        "selector": "variable",
        "format": ["camelCase", "UPPER_CASE", "PascalCase"]
      },
      {
        "selector": "parameter",
        "format": ["camelCase"],
        "leadingUnderscore": "allow"
      },
      {
        "selector": "memberLike",
        "modifiers": ["private"],
        "format": ["camelCase"],
        "leadingUnderscore": "require"
      },
      {
        "selector": "typeLike",
        "format": ["PascalCase"]
      },
      {
        "selector": "interface",
        "format": ["PascalCase"],
        "prefix": ["I"]
      },
      {
        "selector": "enum",
        "format": ["PascalCase"]
      }
    ],
    
    // Canonical export/import pattern rules
    "import/no-default-export": "error",
    "import/extensions": ["error", "always", {
      "ignorePackages": true,
      "pattern": {
        "js": "never",
        "jsx": "never",
        "ts": "never",
        "tsx": "never"
      }
    }],
    "import/prefer-default-export": "off",
    "import/no-unresolved": "error",
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "object",
          "type"
        ],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ]
  },
  "overrides": [
    {
      "files": ["**/*.test.ts", "**/*.spec.ts", "**/vitest.setup.ts"],
      "rules": {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-return": "off"
      }
    }
  ],
  "settings": {
    "import/resolver": {
      "typescript": {},
      "node": {
        "extensions": [".js", ".jsx", ".ts", ".tsx"]
      }
    },
    "import/extensions": [".js", ".jsx", ".ts", ".tsx"]
  }
}
EOF

echo "ESLint configuration has been updated to enforce canonical patterns."