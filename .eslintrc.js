module.exports = {
  root: true,
  extends: [
    'eslint:recommended'
  ],
  env: {
    node: true,
    es6: true
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
      ],
      parser: '@typescript-eslint/parser',
      plugins: [
        '@typescript-eslint'
      ]
    }
  ]
}
