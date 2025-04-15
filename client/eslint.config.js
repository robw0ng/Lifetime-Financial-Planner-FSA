// // eslint.config.js
// import js from '@eslint/js';
// import globals from 'globals';
// import pluginReact from 'eslint-plugin-react';
// import { defineConfig } from 'eslint/config';

// export default defineConfig([
//   {
//     files: ['**/*.{js,mjs,cjs,jsx}'],
//     languageOptions: {
//       ecmaVersion: 2021,
//       sourceType: 'module',
//       parserOptions: { ecmaFeatures: { jsx: true } },
//       globals: globals.browser,
//     },
//     plugins: {
//       js,
//       react: pluginReact,
//     },
//     settings: {
//       react: { version: 'detect' },
//     },
//     rules: {
//       ...js.configs.recommended.rules,
//       'react/react-in-jsx-scope': 'off',
//       semi: ['error', 'always'],
//       quotes: ['error', 'single'],
//     },
//   },
// ]);

// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import pluginUnusedImports from 'eslint-plugin-unused-imports';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: globals.browser,
    },
    plugins: {
      js,
      react: pluginReact,
      'unused-imports': pluginUnusedImports,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // Base rules
      ...js.configs.recommended.rules,

      // React
      ...pluginReact.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Not needed for React 17+

      // Disable default unused-vars (conflicts with unused-imports)
      'no-unused-vars': 'off',

      // Auto-fix unused imports and vars
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // Optional: style
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
    },
  },
]);
