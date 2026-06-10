const test = require('@jest/globals').test;
const describe = require('@jest/globals').describe;

const common = require('./common');
const converter = require('../lib/converter');

describe("CTRF converter tests", () => {

    test('ctrf-comprehensive.json', async() => {
        let options = common.createOptions('ctrf-comprehensive.json', 'ctrf')
        await converter.toFile(options);
        common.compare(options, await converter.toString(options));
    });

    test('ctrf-minimal.json', async() => {
        let options = common.createOptions('ctrf-minimal.json', 'ctrf')
        await converter.toFile(options);
        common.compare(options);
    });

    test('ctrf-with-diagnostics.json', async() => {
        let options = common.createOptions('ctrf-with-diagnostics.json', 'ctrf')
        await converter.toFile(options);
        common.compare(options);
    });

    test('ctrf-with-insights.json', async() => {
        let options = common.createOptions('ctrf-with-insights.json', 'ctrf')
        await converter.toFile(options);
        common.compare(options);
    });

    test('ctrf-with-retries.json', async() => {
        let options = common.createOptions('ctrf-with-retries.json', 'ctrf')
        await converter.toFile(options);
        common.compare(options);
    });

    test('ctrf-with-insights.json', async() => {
        let options = common.createOptions('ctrf-with-insights.json', 'ctrf')
        await converter.toFile(options);
        common.compare(options);
    });

    test('ctrf-qlnet.json', async() => {
        let options = common.createOptions('ctrf-qlnet.json', 'ctrf')
        await converter.toFile(options);
        common.compare(options);
    });

    test('ctrf-mudblazor.json', async() => {
        let options = common.createOptions('ctrf-mudblazor.json', 'ctrf')
        await converter.toFile(options);
        common.compare(options);
    });
});