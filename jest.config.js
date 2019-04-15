module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'lib/**/*.js',
    '!lib/defaults/*.js',
    'index.js',
  ],
  testEnvironment: 'node',
};
