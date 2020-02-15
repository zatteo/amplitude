module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint'
  ],
  extends: [
    'eslint:recommended'
  ],
  env: {
    node: true
  },
  rules: {
    semi: "off",
    quotes: ['error', 'single']
  },
  overrides: [
    {
      files: ["**/*.ts"],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended'
      ]
    }
  ]
}
