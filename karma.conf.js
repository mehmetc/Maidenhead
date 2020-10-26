module.exports = function(config) {
    config.set({
        frameworks: ["jasmine", "karma-typescript"],
        files: [
            "src/**/*.ts"
        ],
        preprocessors: {
            "**/*.ts": "karma-typescript"
        },
        reporters: ["progress", "karma-typescript"],
        browsers: ["ChromeHeadless"],
        karmaTypescriptConfig: {
            bundlerOptions: {
            },
            tsconfig: "./tsconfig.json"
        },
        singleRun: false
    })
};