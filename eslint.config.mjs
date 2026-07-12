import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**'],
  },
  {
    rules: {
      // Literal apostrophes/quotes in JSX prose are fine; the escape-entity
      // requirement is pure noise for this app's lore-heavy copy.
      'react/no-unescaped-entities': 'off',
    },
  },
]

export default eslintConfig
