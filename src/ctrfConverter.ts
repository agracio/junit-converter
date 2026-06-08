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

            let stdout;
            let stderr;

            if(test.stdout && test.stdout.length > 0){
                stdout = [];
                stdout.push({
                    '$t': test.stdout.join('\n'),
                });
            }

            if(test.stderr && test.stderr.length > 0){
                stderr = [];
                stderr.push({
                    '$t': test.stderr.join('\n'),
                });
            }

            let error;

            if(test.message || test.trace){
                error = [];
                error.push({
                    message: test.message,
                    '$t': test.trace,
                });
            }

            let properties: any[] = [];

            if(test.parameters && Object.keys(test.parameters).length > 0){
                properties.push({property: []});
                Object.keys(test.parameters).forEach((key) => {
                    properties[0].property.push({
                        name: key,
                        value: String(test.parameters ? test.parameters[key] : ''),
                    });
                });
            }          

            // if(test.status.toLowerCase() === 'failed' && (test.message || test.trace)){
            //     error = [];
            //     error.push({
            //         message: test.message,
            //         '$t': test.trace,
            //     });
            // }
            // if((test.status.toLowerCase() === 'skipped' || test.status.toLowerCase() === 'pending') && (test.message)){
            //     error = [];
            //     error.push({
            //         message: test.message,
            //         '$t': test.trace,
            //     });
            // }

            this.suites[suiteName].testcase.push({
                name: test.name.replace(`${suiteName}: `, ''),
                classname: suiteName,
                status: test.status.replace('pending', 'skipped'),
                time: String(Number(test.duration) / 1000),
                error: error,
                'system-out': stdout,
                'system-err': stderr,
                properties: properties,
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

        return converted;
    }

}

export const convert = CtrfConverter.convert;

export default { convert };