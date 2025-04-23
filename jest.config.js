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
  module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!axios|@tanstack)/',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.ts'
  ],
  moduleDirectories: ['node_modules', 'src'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest'
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
}; 