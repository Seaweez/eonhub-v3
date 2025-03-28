module.exports = {
  settings: {
    'import/resolver': {
      node: {
        paths: ['./src'],
      },
    },
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  env: {
    es6: true,
    browser: true,
    jest: true,
  },
  extends: [
    'next',
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    // 'plugin:prettier/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  plugins: [ ],
  rules: {
    "react/no-unescaped-entities": "off",
    "@next/next/no-page-custom-font": "off",
    'prettier/prettier': 0,
    'no-console': ['warn', { allow: ['info', 'warn', 'error', 'debug'] }],
    'no-plusplus': 0,
    'prefer-destructuring': ['warn', { object: true, array: false }],
    'no-underscore-dangle': 0,
    'import/prefer-default-export': 0,
    '@typescript-eslint/no-unused-vars': 0,
    // Start temporary rules
    // These rules are here just to keep the lint error to 0 during the migration to the new rule set
    // They need to be removed and fixed as soon as possible
    // "@typescript-eslint/ban-ts-comment": [1, { "ts-ignore": false, "ts-nocheck": false }],
    '@typescript-eslint/no-use-before-define': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/no-explicit-any': 0,
    radix: 0,
    'import/no-extraneous-dependencies': 0,
    'jsx-a11y/media-has-caption': 0,
    // Exchange
    'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: ['state', 'memo'] }],
    'react/require-default-props': 0,
    'no-nested-ternary': 0,
    'max-classes-per-file': 0,
    // End temporary rules
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', ['parent', 'sibling', 'internal']],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
          {
            pattern: 'next',
            group: 'external',
            position: 'before',
          },
          {
            pattern: 'assets/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'styles/**',
            group: 'internal',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['react', 'next'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-named-as-default': 0,
    'import/no-unresolved': 0,
    'import/export': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@next/next/no-img-element': 0,
    '@typescript-eslint/no-empty-interface': 0,
    '@typescript-eslint/consistent-type-imports': 'warn',
    'no-param-reassign': 0,
    '@typescript-eslint/ban-types': 0,
    'react/no-unescaped-entities': 0,
    // disable rules of hooks
    'react-hooks/rules-of-hooks': 0,
  },
  ignorePatterns: ['node_modules/', '.next/'],
}
