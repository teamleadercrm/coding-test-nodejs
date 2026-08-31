import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importX from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';

export default tseslint.config(
  { ignores: ['dist/', 'node_modules/', '*.config.js', '*.config.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver({ alwaysTryTypes: true })],
    },
    rules: {
      'import-x/no-cycle': 'error',

      // The architectural boundary, borrowed from the service this test mirrors.
      // Dependencies flow downward only: routes and tools -> app -> external.
      // routes/ and tools/ are the two callers of the app layer and are peers:
      // neither may import the other.
      // `_`-prefixed files are private to their own module.
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/plugins/external/**',
              from: './src/+(plugins/app|routes|tools)/**',
              message: 'external/ is infrastructure and must not import app or route code.',
            },
            {
              target: './src/plugins/app/**',
              from: './src/+(routes|tools)/**',
              message: 'app/ must not import from its callers (routes/, tools/).',
            },
            {
              target: './src/+(routes|tools|plugins/external)/**',
              from: './src/plugins/app/*/_*',
              message: 'Module internals (_-prefixed) are private. Import the module index instead.',
            },
            {
              target: './src/routes/**',
              from: './src/tools/**',
              message: 'routes/ and tools/ are peers: two doors into the same service, not into each other.',
            },
            {
              target: './src/tools/**',
              from: './src/routes/**',
              message: 'tools/ and routes/ are peers: two doors into the same service, not into each other.',
            },
          ],
        },
      ],
    },
  },
);
