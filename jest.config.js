module.exports = {
    transform: {
      '^.+\\.(ts|tsx)$': 'babel-jest'
    },
    transformIgnorePatterns: [
      "/node_modules/(?!(axios)/)"  // transform axios ESM
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    testEnvironment: 'jsdom'
  };
  