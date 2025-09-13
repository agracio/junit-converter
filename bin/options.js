export const yargsOptions = {
    testFile: {
        describe: 'Path to test file',
        string: true,
        default: undefined,
    },
    testType: {
        describe: 'Test type',
        string: true,
        default: undefined,
    },
    reportDir: {
        default: './report',
        describe: 'Report output directory',
        string: true,
    },
    reportFile: {
        default: undefined,
        describe: 'JUnit report file name',
        string: true,
    },
    splitByClassname: {
        default: false,
        describe: 'Split tests into separate test suites by classname',
        boolean: true,
    },
};