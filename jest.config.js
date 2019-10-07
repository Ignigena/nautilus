module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    'packages/(.*)/(config|test)',
  ],
  testEnvironment: 'node',
};
