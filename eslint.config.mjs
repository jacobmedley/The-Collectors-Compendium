import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['collection.jsx'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // Icons and component functions are used as JSX elements (<Search/>, <ItemCard/> etc.)
      // but ESLint without eslint-plugin-react can't see JSX tag names as variable references,
      // so we suppress false positives for capitalized names (components, icons, constants).
      'no-unused-vars': ['warn', {
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_',
        caughtErrors: 'none',
      }],
      // Empty catch blocks are intentional in the localStorage/storage persistence layer.
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-console': 'off',
    },
  },
];
