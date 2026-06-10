import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';

import { ConverterOptions, TestSuites, TestSuite } from './interfaces.js';
import { CTRFReport, Test } from './ctrf.js';

export class CtrfConverter {

    private static suites: Record<string, TestSuite> = {};

    private static getStdout(stdin: string[] | undefined): any[] | undefined {
        let stdout;
        if(stdin && stdin.length > 0){
            stdout = [];
            stdout.push({
                '$t': stdin.join('\n'),
            });
        }
        return stdout;
    }

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

            let stdout = this.getStdout(test.stdout);
            let stderr = this.getStdout(test.stderr);

            let failure;

            if(test.message || test.trace){
                failure = [];
                failure.push({
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

            this.suites[suiteName].testcase.push({
                name: test.name.replace(`${suiteName}: `, ''),
                classname: suiteName,
                status: test.status.replace('pending', 'skipped'),
                time: String(Number(test.duration) / 1000),
                failure: failure,
                'system-out': stdout,
                'system-err': stderr,
                properties: properties,
            });
        });
    }

    static convert(options: ConverterOptions): TestSuites{
        const report = JSON.parse(fs.readFileSync(options.testFile, 'utf8')) as CTRFReport;
        this.suites = {};
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

        if(options.saveIntermediateFiles){
            fs.writeFileSync(path.join(options.reportDir, `${path.parse(options.testFile).name}-converted.json`), JSON.stringify(converted, null, 2), 'utf8');
        }

        return converted;
    }
}