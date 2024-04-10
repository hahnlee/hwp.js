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
    ...tseslint.configs.recommendedTypeChecked,
    {
      files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
      ...tseslint.configs.disableTypeChecked,
    },
    {
      rules: {
        '@typescript-eslint/no-unsafe-enum-comparison': 'off',
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
