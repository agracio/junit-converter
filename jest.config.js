module.exports = {
    verbose: true,
    globalTeardown: "./tests/teardown.js",
    reporters: [
        'default',
        ['github-actions', {silent: false}], 
        'summary',
        ['jest-junit', { suiteName: "junit-converter tests" }]
        // ["jest-html-reporters", {
        //     publicPath: './tests/report',
        //     filename: 'report.html',
        //     darkTheme: true,
        //     pageTitle: 'junit-converter',
        //     expand: true,
        //     urlForTestFiles: 'https://github.com/agracio/junit-converter/blob/main'
        //   }
        // ]
    ],
    "collectCoverageFrom": [
        "lib/**/*.js"
    ],
}