module.exports = {
    // Use ts-jest preset for testing TypeScript files with Jest
    preset: "ts-jest",
    // Set the test environment to Node.js
    testEnvironment: "node",
    verbose: true,
    // Define the root directory for tests and modules
    roots: ["<rootDir>/tests"],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest",
    },
    // Regular expression to find test files
    testRegex: "((\\.|/)(test|spec))\\.tsx?$",
    // File extensions to recognize in module resolution
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    testTimeout: 10000,

    // collectCoverage: true,
    // coverageProvider: "v8",
    // collectCoverageFrom: ["src/**/*.ts", "!tests/**", "!**/node_modules/**"],
};
