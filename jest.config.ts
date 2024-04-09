export default {
	testEnvironment: "jsdom",
	transform: {
		"^.+\\.tsx?$": "ts-jest",
	},

	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
		"\\.(css|less|sass|scss)$": "identity-obj-proxy",
	},

	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
