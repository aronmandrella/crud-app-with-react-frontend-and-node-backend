const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleDirectories: ["node_modules", "<rootDir>/"],
  moduleNameMapper: {
    "^@ui$": "<rootDir>/src/ui",
    "^@ui/(.*)$": "<rootDir>/src/ui/$1",
    "^@helpers$": "<rootDir>/src/helpers",
    "^@helpers/(.*)$": "<rootDir>/src/helpers/$1",
  },
  testEnvironment: "jest-environment-jsdom",
};

module.exports = createJestConfig(customJestConfig);
