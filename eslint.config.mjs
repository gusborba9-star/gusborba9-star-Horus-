import { defineConfig, globalIgnores } from 'eslint/config';
import nextPlugin from '@next/eslint-plugin-next';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

const sharedPlugins = {
  '@next/next': nextPlugin,
  react,
  'react-hooks': reactHooks,
};

const sharedSettings = {
  react: { version: 'detect' },
};

const sharedRules = {
  ...react.configs.flat.recommended.rules,
  ...react.configs.flat['jsx-runtime'].rules,
  ...reactHooks.configs.flat.recommended.rules,
  ...nextPlugin.configs.recommended.rules,
};

export default defineConfig([
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    plugins: sharedPlugins,
    settings: sharedSettings,
    rules: sharedRules,
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: sharedPlugins,
    settings: sharedSettings,
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: sharedRules,
  },
]);
