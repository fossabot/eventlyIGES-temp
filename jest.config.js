module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },
  transform: {
    "^.+\\.(ts|tsx)$": "babel-jest",
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/dist/"],
};
