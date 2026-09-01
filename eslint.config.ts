import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments';
import prettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import type { Rule } from 'eslint';

const DIRECTIVE_PATTERN = /^\s*(eslint|global|globals|exported|jshint|prettier-ignore|@ts-)/;

const noComments: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow comments except lint directives and allowed JSDoc' },
    schema: [
      {
        type: 'object',
        properties: { allowExportedJsDoc: { type: 'boolean' } },
        additionalProperties: false,
      },
    ],
    messages: {
      noComment:
        'Comments are not allowed (ADR-007). Rename the symbol or write a test that documents the rule.',
      jsDocOnly:
        'Only JSDoc blocks on exported declarations are allowed here (ADR-007). Line comments are not.',
      jsDocNotExported: 'JSDoc is allowed only directly above an exported declaration (ADR-007).',
    },
  },
  create(context) {
    const options = context.options[0] as { allowExportedJsDoc?: boolean } | undefined;
    const allowExportedJsDoc = options?.allowExportedJsDoc === true;
    const sourceCode = context.sourceCode;

    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          const loc = comment.loc;

          if (loc === undefined || loc === null || DIRECTIVE_PATTERN.test(comment.value)) {
            continue;
          }

          if (!allowExportedJsDoc) {
            context.report({ loc, messageId: 'noComment' });
            continue;
          }

          const isJsDoc = comment.type === 'Block' && comment.value.startsWith('*');
          if (!isJsDoc) {
            context.report({ loc, messageId: 'jsDocOnly' });
            continue;
          }

          const nextToken = sourceCode.getTokenAfter(comment, { includeComments: false });
          if (nextToken?.value !== 'export') {
            context.report({ loc, messageId: 'jsDocNotExported' });
          }
        }
      },
    };
  },
};

const BLOCK_DISABLE_PATTERN = /^\s*eslint-(disable|enable)(?!-next-line)\b/;

const noBlockDisable: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow file- or block-level eslint-disable and eslint-enable' },
    schema: [],
    messages: {
      blockDisable:
        'Only eslint-disable-next-line is allowed (§10). A file- or block-level eslint-disable or eslint-enable is not, even with a description.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          if (comment.loc && BLOCK_DISABLE_PATTERN.test(comment.value)) {
            context.report({ loc: comment.loc, messageId: 'blockDisable' });
          }
        }
      },
    };
  },
};

const local = { rules: { 'no-comments': noComments, 'no-block-disable': noBlockDisable } };

export default defineConfig(
  { ignores: ['dist', 'coverage', 'node_modules', '.vercel'] },

  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { local, '@eslint-community/eslint-comments': eslintComments },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    rules: {
      'local/no-comments': 'error',
      'local/no-block-disable': 'error',

      '@eslint-community/eslint-comments/no-unlimited-disable': 'error',
      '@eslint-community/eslint-comments/require-description': ['error', { ignore: [] }],
      '@eslint-community/eslint-comments/no-aggregating-enable': 'error',
      '@eslint-community/eslint-comments/disable-enable-pair': 'error',
      '@eslint-community/eslint-comments/no-unused-disable': 'error',

      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': true,
          'ts-expect-error': 'allow-with-description',
          minimumDescriptionLength: 20,
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'], leadingUnderscore: 'forbid' },
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
        {
          selector: 'variable',
          modifiers: ['const'],
          types: ['function'],
          format: ['camelCase', 'PascalCase'],
        },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['UPPER_CASE'] },
        { selector: 'objectLiteralProperty', format: null },
        { selector: 'objectLiteralMethod', format: null },
        { selector: 'typeProperty', format: ['camelCase'] },
        { selector: 'import', format: ['camelCase', 'PascalCase'] },
      ],

      complexity: ['error', 10],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-depth': ['error', 3],
      'max-params': ['error', 4],
      'no-magic-numbers': [
        'error',
        { ignore: [-1, 0, 1], ignoreArrayIndexes: true, enforceConst: true, detectObjects: false },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-else-return': 'error',
    },
  },

  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'firebase/firestore',
              message:
                'ADR-001: the browser never talks to Firestore. Go through an /api endpoint instead.',
            },
            {
              name: 'firebase-admin',
              message: 'ADR-001: firebase-admin is server-only. It belongs in api/.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/components/admin/**', '@/components/admin/**', '**/admin/**'],
              message: 'ADR-010: the invitation and the console do not share components.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['src/components/admin/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/components/ui/**', '@/components/ui/**', '**/ui/**'],
              message: 'ADR-010: the console does not consume the invitation design system.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['api/_lib/**/*.ts'],
    rules: { 'local/no-comments': ['error', { allowExportedJsDoc: true }] },
  },

  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'no-magic-numbers': 'off',
      'max-lines-per-function': 'off',
    },
  },

  {
    files: ['scripts/**/*.ts', '*.config.ts'],
    rules: {
      'no-console': 'off',
      'no-magic-numbers': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },

  prettier,
);
