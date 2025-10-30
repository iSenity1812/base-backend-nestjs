import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

// Flat config for ESLint v9: avoid any "extends" from eslintrc-based configs
export default tseslint.config(
  // JavaScript recommended rules
  js.configs.recommended,
  // Global Node/Jest globals for the backend codebase
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  // TypeScript recommended (no type-checking to keep CI fast and avoid strict unsafe-* errors initially)
  ...tseslint.configs.recommended,
  // Project-specific overrides
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['dist/**'],
    languageOptions: {
      parser: tseslint.parser,
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      prettier,
    },
    rules: {
  '@typescript-eslint/no-explicit-any': 'off',
  // Disable type-aware rules for now; can be enabled later with project service
  '@typescript-eslint/no-floating-promises': 'off',
  '@typescript-eslint/no-unsafe-argument': 'off',
      // Treat unused vars as warnings and ignore names prefixed with _
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
  // JS files (CommonJS) - allow require() and module exports
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  }
);
