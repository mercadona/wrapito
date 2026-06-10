import js from '@eslint/js'
import globals from 'globals'
import reactPlugin from 'eslint-plugin-react'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2015,
        ...globals.jest,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
      'no-var': 'error',
      'no-empty': 'error',
      'block-scoped-var': 'error',
      eqeqeq: 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-empty-function': 'error',
      semi: ['error', 'never'],
      'comma-dangle': ['error', 'always-multiline'],
      'keyword-spacing': ['error', { after: true, before: true }],
      'object-curly-spacing': ['error', 'always'],
      'template-curly-spacing': ['error', 'never'],
      'space-before-function-paren': [
        'error',
        { anonymous: 'always', named: 'never', asyncArrow: 'always' },
      ],
      'object-curly-newline': [
        'error',
        {
          ObjectExpression: { consistent: true },
          ObjectPattern: { multiline: true },
        },
      ],
      'max-len': ['error', { code: 120 }],
      complexity: ['warn', 8],
      'react/jsx-curly-spacing': ['error', 'always'],
      'react/jsx-equals-spacing': ['error', 'never'],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': false, 'ts-ignore': true },
      ],
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  prettierRecommended,
)
