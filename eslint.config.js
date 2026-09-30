import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/@mf-types/**', '**/node_modules/**'],
  },

  js.configs.recommended,

  // Type-aware linting for the application and package sources.
  {
    files: ['apps/*/src/**/*.{ts,tsx}', 'packages/*/src/**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: globals.browser,
    },
  },

  // Rules of Hooks and exhaustive dependencies: the subscriptions in this
  // project live or die by the cleanup functions these rules check.
  reactHooks.configs.flat['recommended-latest'],

  // Build configuration runs in Node and is not part of any tsconfig.
  {
    files: ['**/webpack.config.js', 'build/**/*.cjs', 'eslint.config.js'],
    languageOptions: {
      globals: globals.node,
      sourceType: 'commonjs',
    },
  },
  {
    files: ['eslint.config.js'],
    languageOptions: { sourceType: 'module' },
  },
);
