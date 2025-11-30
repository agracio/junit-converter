import * as path from 'path';
import * as fs from 'fs';
import { ConverterOptions, TestReportConverterOptions, TestType } from './interfaces';

export class ConfigService {
    static readonly TestType = TestType;

    static config(options: TestReportConverterOptions): ConverterOptions {
        if (!options) {
            throw new Error('options are required.');
        }

        if (!options.testFile) {
            throw new Error("Option 'testFile' is required.");
        }

        if (!fs.existsSync(options.testFile)) {
            throw new Error(`Could not find file ${options.testFile}.`);
        }

        const testFile = options.testFile;

        if (!options.testType) {
            throw new Error("Option 'testType' is required.");
        }

        const testTypeLower = options.testType.toLowerCase();
        if (!Object.values(TestType).includes(testTypeLower as TestType)) {
            throw new Error(`Test type '${options.testType}' is not supported.`);
        }

        const testType = testTypeLower as TestType;

        let reportDir = './report';
        let reportFile = `${path.parse(options.testFile).name}-junit.xml`;
        let saveIntermediateFiles = false;
        let splitByClassname = false;
        let minify = false;

        if (options.splitByClassname === true || options.splitByClassname === 'true') {
            splitByClassname = true;
        }

        if (options.saveIntermediateFiles === true || options.saveIntermediateFiles === 'true') {
            saveIntermediateFiles = true;
        }

        if (options.minify === true || options.minify === 'true') {
            minify = true;
        }

        if (options.reportDir) {
            reportDir = options.reportDir;
        }

        if (options.reportFilename) {
            reportFile = options.reportFilename;
        }

        if (options.reportFile) {
            reportFile = options.reportFile;
        }

        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        return {
            testFile,
            testType,
            skippedAsPending: true,
            reportDir,
            reportPath: path.join(reportDir, reportFile),
            reportFile,
            splitByClassname,
            minify,
            saveIntermediateFiles,
        };
    }
}

export const config = ConfigService.config;
export const testTypeEnum = ConfigService.TestType;

export default { config, TestType: ConfigService.TestType };

