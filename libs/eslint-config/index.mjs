// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

/**
 * @param {string} tsconfigDirName
 * @param {...import('typescript-eslint').ConfigWithExtends} args
 * @returns
 */
export default function config(tsconfigDirName, ...args) {
  return tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    {
      files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
      ...tseslint.configs.disableTypeChecked,
    },
    {
      rules: {
        '@typescript-eslint/no-unsafe-enum-comparison': 'off',
        '@typescript-eslint/restrict-template-expressions': ['error', {
          allowNever: true,
        }],
        '@typescript-eslint/unbound-method': ['error', {
          ignoreStatic: true,
        }]
      },
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx'],
      rules: {
        '@typescript-eslint/no-floating-promises': 'off',
      },
    },
    {
      languageOptions: {
        parserOptions: {
          project: true,
          tsconfigDirName,
        },
      },
    },
    ...args,
  )
}
