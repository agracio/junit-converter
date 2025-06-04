'use strict';
const path = require('path');
const config = require('../src/config');
const fs = require('fs');
const expect = require('@jest/globals').expect;
const test = require('@jest/globals').test;
const describe = require('@jest/globals').describe;

describe("Config tests", () => {

    test('throw if no options are provided', () => {
        expect(() => config.config()).toThrow(/^options are required/);
    });

    test('throw if testFile is not provided', () => {
        expect(() => config.config({})).toThrow(/^Option 'testFile' is required/);
    });

    test('throw if testFile cannot be resolved', () => {
        let options = {
            testFile: 'mytestfile.xml'
        }
        expect(() => config.config(options)).toThrow(/^Could not find file/);
    });

    test('throw if testType is not provided', () => {
        let options = {
            testFile: path.join(__dirname, 'data/source/xunit-qlnet.xml')
        }
        expect(() => config.config(options)).toThrow(/^Option 'testType' is required/);
    });

    test('throw if testType is incorrect', () => {
        let options = {
            testFile: path.join(__dirname, 'data/source/xunit-qlnet.xml'),
            testType: 'xunit123'
        }
        expect(() => config.config(options)).toThrow(/^Test type 'xunit123' is not supported/);
    });

    test('return correct default values', () => {
        let options = {
            testFile: path.join(__dirname, 'data/source/xunit-qlnet.xml'),
            testType: 'xunit'
        }

        let result = config.config(options)

        expect(result.testFile).toBe(path.join(__dirname, 'data/source/xunit-qlnet.xml'));
        expect(result.testType).toBe('xunit');
        expect(result.splitByClassname).toBe(false);
        expect(result.switchClassnameAndName).toBe(false);
        expect(result.reportDir).toBe('./report');
        expect(result.reportPath).toBe(path.join(result.reportDir, 'xunit-qlnet-junit.xml'));
        expect(result.saveIntermediateFiles).toBe(false);
    });

    test('return correct values from assigned options', () => {
        let options = {
            testFile: path.join(__dirname, 'data/source/xunit-qlnet.xml'),
            testType: 'xunit',
            skippedAsPending: false,
            switchClassnameAndName: true,
            splitByClassname: true,
            reportDir: './report1',
            reportFilename: 'xunit-j.xml',
            saveIntermediateFiles: true,
        }

        let result = config.config(options)

        expect(result.testFile).toBe(path.join(__dirname, 'data/source/xunit-qlnet.xml'));
        expect(result.testType).toBe('xunit');
        expect(result.splitByClassname).toBe(true);
        expect(result.switchClassnameAndName).toBe(true);
        expect(result.reportDir).toBe('./report1');
        expect(result.reportPath).toBe(path.join(result.reportDir, 'xunit-j.xml'));
        expect(result.saveIntermediateFiles).toBe(true);

        expect(fs.existsSync(result.reportDir)).toBe(true)

        if(fs.existsSync(result.reportDir)){
            fs.rmdirSync(result.reportDir);
        }
    });
});