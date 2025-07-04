const test = require('@jest/globals').test;
const describe = require('@jest/globals').describe;

const converter = require('../src/converter');
const common = require("./common");

describe("JUnit converter tests", () => {

    test('junit-jenkins.xml', async() => {
        let options = common.createOptions('junit-jenkins.xml', 'junit');

        await converter.toFile(options);
        common.compare(options);
    });

    test('junit-notestsuites.xml', async() => {
        let options = common.createOptions('junit-notestsuites.xml', 'junit');

        await converter.toFile(options);
        common.compare(options);
    });

    test('junit-testsuites-noattributes.xml', async() => {
        let options = common.createOptions('junit-testsuites-noattributes.xml', 'junit');

        await converter.toFile(options);
        common.compare(options);
    });

    test('junit-mocha-xunit.xml', async() => {
        let options = common.createOptions('junit-mocha-xunit.xml', 'junit');

        await converter.toFile(options);
        common.compare(options);
    });

    test('junit-nested.xml', async() => {
        let options = common.createOptions('junit-nested.xml', 'junit', true);

        await converter.toFile(options);
        common.compare(options);
    });
    test('junit-qlnet.xml', async() => {
        let options = common.createOptions('junit-qlnet.xml', 'junit');
        options.splitByClassname = true;

        await converter.toFile(options);
        common.compare(options);
    });
});