import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';

import { ConverterOptions, XmlParserOptions, TestSuites, TestSuite } from './interfaces.js';
import { CTRFReport, Test } from './ctrf.js';

export class CtrfConverter {

    private static suites: Record<string, TestSuite> = {};

    private static parseTests(report: CTRFReport) {
        let suiteName: string = 'Root Suite';

        report.results.tests.forEach((test: Test) => {

            if(test.suite && test.suite.length > 0){
                if(typeof test.suite === 'string'){
                    suiteName = test.suite;
                }
                else if(Array.isArray(test.suite)){
                    suiteName = test.suite.join(' > ');
                }
            }

            if(!this.suites[suiteName]){
                    this.suites[suiteName] = {
                    name: suiteName,
                    tests: 0,
                    failures: 0,
                    skipped: 0,
                    errors: 0,
                    time: 0,
                    testcase: []
                };
            }

            this.suites[suiteName].tests = Number(this.suites[suiteName].tests) + 1;
            this.suites[suiteName].time = Number(this.suites[suiteName].time) + Number(test.duration) / 1000;
            if(test.status.toLowerCase() === 'failed'){
                this.suites[suiteName].failures = Number(this.suites[suiteName].failures) + 1;
            }
            else if(test.status.toLowerCase() === 'skipped'){
                this.suites[suiteName].skipped = Number(this.suites[suiteName].skipped) + 1;
            }
            else if(test.status.toLowerCase() === 'pending'){
                this.suites[suiteName].skipped = Number(this.suites[suiteName].skipped) + 1;
            }



            this.suites[suiteName].testcase.push({
                name: test.name,
                classname: suiteName,
                status: test.status.replace('pending', 'skipped'),
                time: String(Number(test.duration) / 1000),
                failure: test.status.toLowerCase() === 'failed' ? {
                    message: test.message,
                    trace: test.trace,
                } : undefined,
                skipped: test.status.toLowerCase() === 'skipped' || test.status.toLowerCase() === 'pending' ? {
                    message: test.message,
                    trace: test.trace,
                } : undefined,
            });


        });
    }

    static convert(options: ConverterOptions): TestSuites{
        const report = JSON.parse(fs.readFileSync(options.testFile, 'utf8')) as CTRFReport;
        const duration = report.results.summary.duration
                ? Number(report.results.summary.duration) / 1000
                : _.sumBy(report.results.tests, function (test: Test) {
                    return (Number(test.duration) || 0) / 1000;
                });

        this.parseTests(report);

        const converted = {
            testsuites: [
                {
                    name: report.results.environment?.reportName || 'CTRF Test Suite',
                    tests: report.results.summary.tests,
                    failures: report.results.summary.failed,
                    skipped: report.results.summary.skipped + report.results.summary.pending,
                    errors: 0,
                    time: duration,
                    testsuite: Object.values(this.suites),
                },
            ],
        };

        console.log(converted);
        return converted;
    }

}

export const convert = CtrfConverter.convert;

export default { convert };