import * as fs from 'fs';
import * as path from 'path';
import xmlFormat from 'xml-formatter';
import * as _ from 'lodash';
const parser: any = require('p3x-xml2json');
import { ConverterOptions, XmlParserOptions, TestSuites, TestCase } from './interfaces';

/**
 * Service class for XML processing and formatting
 */
export class XmlProcessor {
    /**
     * Sort test cases by classname and restructure test suites
     * @param options Converter configuration
     * @param json Parsed test suites JSON
     * @returns Modified JSON with sorted test cases
     */
    static sortByClassname(options: ConverterOptions, json: TestSuites): TestSuites {
        if (!json?.testsuites?.[0]?.testsuite?.[0]?.testcase) {
            return json;
        }

        // Sort test cases by classname and name
        json.testsuites[0].testsuite[0].testcase = _.sortBy(
            json.testsuites[0].testsuite[0].testcase,
            ['classname', 'name']
        );

        // Extract unique classnames
        let classnames = _.map(json.testsuites[0].testsuite[0].testcase, 'classname')
            .filter((value: string | undefined, index: number, array: (string | undefined)[]): boolean =>
                array.indexOf(value) === index
            ) as string[];

        classnames = _.sortBy(classnames, (o) => o);

        // Calculate total time
        const time = _.sumBy(
            json.testsuites[0].testsuite,
            (suite) => _.sumBy(suite.testcase, (testCase: TestCase) => Number(testCase.time))
        );

        json.testsuites[0].time = time;
        json.testsuites[0].testsuite[0].time = String(time);

        if (classnames.length > 1) {
            const testSuites = classnames.map((classname) => {
                const testcases = _.filter(json.testsuites[0].testsuite[0].testcase, {
                    classname,
                });
                const suiteTime = _.sumBy(testcases, (testCase: TestCase) => Number(testCase.time));
                const failures = testcases.filter((testCase: TestCase) => testCase.status === 'Failed').length;
                const skipped = testcases.filter((testCase: TestCase) => testCase.status === 'Skipped').length;

                return {
                    name: classname,
                    tests: `${testcases.length}`,
                    failures: `${failures}`,
                    skipped: `${skipped}`,
                    time: `${suiteTime}`,
                    testcase: testcases,
                };
            });

            json.testsuites[0].testsuite = testSuites;
        } else {
            json.testsuites[0].testsuite[0].time = String(time);
            json.testsuites[0].testsuite[0].name = json.testsuites[0].testsuite[0].testcase[0].classname;
        }

        return json;
    }

    /**
     * Process XML string and optionally restructure by classname
     * @param options Converter configuration
     * @param xml XML string to process
     * @returns Formatted XML string
     * @throws {Error} If JSON parsing fails or no test suites found
     */
    static processXml(options: ConverterOptions, xml: string): string {
        const xmlParserOptions: XmlParserOptions = {
            object: true,
            arrayNotation: true,
            sanitize: false,
            reversible: true,
        };

        let json: TestSuites;

        try {
            json = parser.toJson(xml, xmlParserOptions) as TestSuites;
        } catch (e) {
            throw new Error(
                `Could not parse JSON from converted XML ${options.testFile}.\n ${
                    e instanceof Error ? e.message : String(e)
                }`
            );
        }

        // Validate that test suites exist
        if (
            !json?.testsuites?.length ||
            !json.testsuites[0]?.testsuite?.length
        ) {
            console.warn('No test suites found, skipping JUnit file creation.');
            return null as any;
        }

        // Save intermediate JSON if requested
        if (options.saveIntermediateFiles) {
            const fileName = `${path.parse(options.testFile).name}-converted.json`;
            const reportDir = options.reportDir || './report';
            fs.writeFileSync(
                path.join(reportDir, fileName),
                JSON.stringify(json, null, 2),
                'utf8'
            );
        }

        // Sort test suites
        if (json.testsuites[0].testsuite[0].file && json.testsuites[0].testsuite[0].name) {
            json.testsuites[0].testsuite = _.sortBy(json.testsuites[0].testsuite, ['file', 'name']);
        } else if (json.testsuites[0].testsuite[0].name) {
            json.testsuites[0].testsuite = _.sortBy(json.testsuites[0].testsuite, ['name']);
        }

        // Apply classname sorting if configured
        json = this.sortByClassname(options, json);

        // Convert back to XML and format
        xmlParserOptions.sanitize = true;
        const xmlOutput = parser.toXml(json, xmlParserOptions);

        return options.minify
            ? xmlFormat.minify(xmlOutput, { forceSelfClosingEmptyTag: true })
            : xmlFormat(xmlOutput, { forceSelfClosingEmptyTag: true });
    }
}

export const processXml = XmlProcessor.processXml;

export default { processXml };

