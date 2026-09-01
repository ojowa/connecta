module.exports = {
  root: true,
  extends: ['universe/native'],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  overrides: [
    {
      files: ['tests/**/*.ts', '**/*.test.ts', '**/*.test.tsx'],
      env: { jest: true },
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
