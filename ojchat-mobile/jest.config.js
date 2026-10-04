module.exports = {
  preset: 'jest-expo',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  collectCoverageFrom: [
    'src/services/crypto/**/*.{ts,tsx}',
    'src/store/**/*.{ts,tsx}',
    'src/services/api/**/*.{ts,tsx}',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?(react-native|expo|@react-native|@react-navigation|@stablelib)|expo-router|@expo))',
  ],
  moduleNameMapper: {
    '^react-native/setup-env$': '<rootDir>/__mocks__/setup-env.js',
  },
};
