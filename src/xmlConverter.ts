import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import xmlFormat from 'xml-formatter';
import * as xsltProcessor from 'xslt-processor';
import {toJson, toXml} from 'p3x-xml2json';
import { ConverterOptions, XmlParserOptions, TestSuites, TestCase } from './interfaces';


export class XmlConverter {

    /**
     * Sort test cases by classname and restructure test suites
     * @param options Converter configuration
     * @param json Parsed test suites JSON
     * @returns Modified JSON with sorted test cases
     */
    private static sortByClassname(options: ConverterOptions, json: TestSuites): TestSuites {
        if (options.testType !== 'trx' && !options.splitByClassname) {
            return json;
        }
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
     * Enhance XML string and optionally restructure by classname
     * @param options Converter configuration
     * @param xml XML string to process
     * @returns Formatted XML string
     * @throws {Error} If JSON parsing fails or no test suites found
     */
    private static enhanceXml(options: ConverterOptions, xml: string): string {
        const xmlParserOptions: XmlParserOptions = {
            object: true,
            arrayNotation: true,
            sanitize: false,
            reversible: true,
        };

        let json: TestSuites;

        try {
            json = toJson(xml, xmlParserOptions) as TestSuites;
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
        const xmlOutput = toXml(json, xmlParserOptions);

        return options.minify
            ? xmlFormat.minify(xmlOutput, { forceSelfClosingEmptyTag: true })
            : xmlFormat(xmlOutput, { forceSelfClosingEmptyTag: true });
    }

    /**
     * Process converted XML and optionally split by classname
     * @param {ConverterOptions} options Converter configuration
     * @param {Promise<string>} xmlString Converted XML string
     * @returns Formatted XML string
     * @throws {Error} If XML formatting fails
     */
    private static async processXml(options: ConverterOptions, xmlString: string): Promise<string> {
        let parsedXml: string;

        // Save intermediate XML if requested
        if (options.saveIntermediateFiles) {
            const fileName = `${path.parse(options.testFile).name}-converted.xml`;
            const reportDir = options.reportDir || './report';
            fs.writeFileSync(path.join(reportDir, fileName), xmlString, 'utf8');
        }

        try {
            parsedXml = options.minify
                ? xmlFormat.minify(xmlString, { forceSelfClosingEmptyTag: true })
                : xmlFormat(xmlString, { forceSelfClosingEmptyTag: true });
        } catch (e) {
            throw new Error(
                `\nXML parsed from ${options.testFile} is empty or invalid \n${
                    e instanceof Error ? e.message : String(e)
                }`
            );
        }

        // return this
        //         .enhanceXml(options, parsedXml)
        //         .replaceAll('&apos;', '\'')
        //         .replaceAll('&amp;gt;', '&gt;')
        //         .replaceAll('&amp;lt;', '&lt;');

        if (options.testType !== 'trx' && !options.splitByClassname) {
            return parsedXml.replaceAll('&#xD;', '');
        } else {
            return this
                .enhanceXml(options, parsedXml)
                .replaceAll('&amp;#xD;', '')
                .replaceAll('&amp;#xD;', '')
                .replaceAll('&amp;gt;', '&gt;')
                .replaceAll('&amp;lt;', '&lt;');
        }
    }

    /**
     * Convert test report to JUnit XML format
     * @param {ConverterOptions} options Converter configuration
     * @returns {Promise<string>} Async formatted JUnit XML string
     * @throws {Error} If XSLT processing fails
     */
    static async convert(options: ConverterOptions): Promise<string> {
        const xsltFile = `../xslt/${options.testType}-junit.xslt`;

        const xsltString = fs.readFileSync(path.join(__dirname, xsltFile), 'utf8');
        const xmlString = fs.readFileSync(options.testFile, 'utf8');

        const xslt = new xsltProcessor.Xslt();
        const xmlParser = new xsltProcessor.XmlParser();
        let xml: string;

        try {
            xml = await xslt.xsltProcess(
                xmlParser.xmlParse(xmlString),
                xmlParser.xmlParse(xsltString)
            );
        } catch (e) {
            throw new Error(
                `Could not process XML file ${options.testFile} using XSLT ${xsltFile} \n${
                    e instanceof Error ? e.message : String(e)
                }`
            );
        }

        return await this.processXml(options, xml);
    }
    
}