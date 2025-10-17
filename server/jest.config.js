/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    testMatch: [
        // Mantieni questo per sicurezza, se in futuro userai __tests__
        "<rootDir>/src/**/__tests__/**/*.[jt]s?(x)",
        // Questo è il pattern che dovrebbe trovare i tuoi test attuali:
        "<rootDir>/src/tests/**/*.{spec,test}.[jt]s?(x)",
        // Un'alternativa più generale che include anche il caso precedente:
        // "<rootDir>/src/**/*.test.[jt]s?(x)",
        // "<rootDir>/src/**/*.spec.[jt]s?(x)",
    ],
    moduleFileExtensions: ["ts", "js", "json"],
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    clearMocks: true,
    verbose: true,
    setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
};