module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/apps', '<rootDir>/libs'],
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/libs/$1/src',
  },
};
