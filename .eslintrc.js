module.exports = {
  root: true,
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 8
  },
  env: {
    node: true,
    es6: true
  },
  rules: {
    semi: ['error', 'never'],
    quotes: ['error', 'single'],
    'comma-dangle': 'error',
    'object-curly-spacing': ['error', 'always']
  },
  overrides: [
    {
      files: ['**/*.ts'],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended'
      ],
      parser: '@typescript-eslint/parser',
      plugins: [
        '@typescript-eslint'
      ]
    }
  ]
}
