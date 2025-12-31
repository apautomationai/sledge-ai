import { nextJsConfig } from '@workspace/eslint-config/next-js';

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    rules: {
      // Add your rule overrides here
      // Example overrides:
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      // Code style rules
      'semi': ['warn', 'always'],
      'quotes': ['warn', 'single', { 'avoidEscape': true }],
      'indent': ['warn', 2, { 'SwitchCase': 1 }],
    }
  }
];
