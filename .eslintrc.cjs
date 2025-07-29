module.exports = {
  extends: [
    'next/core-web-vitals',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'prettier'
  ],
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  globals: {
    // Browser globals
    HTMLElement: 'readonly',
    HTMLInputElement: 'readonly',  
    HTMLTextAreaElement: 'readonly',
    HTMLDivElement: 'readonly',
    MouseEvent: 'readonly',
    Blob: 'readonly',
    URL: 'readonly',
    sessionStorage: 'readonly',
    localStorage: 'readonly',
    navigator: 'readonly',
    document: 'readonly',
    window: 'readonly',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      },
    ],
    'no-empty-object-type': 'off',
    'react/no-unknown-property': 'off',
    'prettier/prettier': 'off',
    'no-undef': 'off',
    'no-case-declarations': 'off',
    'react-hooks/exhaustive-deps': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};