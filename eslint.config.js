// ESLint v9+ config migration for TypeScript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  js.config({
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      // Enforce ESM import/export usage
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='require']",
          message: 'Use ESM import syntax instead of require() in runtime code.'
        },
        {
          selector: "MemberExpression[object.name='module'][property.name='exports']",
          message: 'Use ESM export syntax instead of module.exports in runtime code.'
        }
      ],
      // Enforce .js extension for local imports
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'always',
          ts: 'never',
          mjs: 'never',
          jsx: 'never',
          tsx: 'never'
        }
      ],
    },
  }),
  tseslint.config({
    files: ['**/*.ts'],
    rules: {},
  }),
];
