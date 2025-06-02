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
    reportFilename: {
        default: undefined,
        describe: 'JUnit report name',
        string: true,
    },
    switchClassnameAndName: {
        default: false,
        describe: 'Switch test case classname and name',
        boolean: true,
    },
    splitByClassname: {
        default: false,
        describe: 'Split tests into separate test suites by classname',
        boolean: true,
    },
};