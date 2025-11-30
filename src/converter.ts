import * as fs from 'fs';
import xmlFormat from 'xml-formatter';
import * as xsltProcessor from 'xslt-processor';
import * as path from 'path';
import { XmlProcessor } from './junit.js';
import { ConfigService } from './config.js';
import { ConverterOptions, TestReportConverterOptions, XmlParserOptions, TestSuites } from './interfaces';

// Import p3x-xml2json with any type to avoid strict type checking
const parser: any = require('p3x-xml2json');

/**
 * Main converter service for test reports to JUnit XML
 */
export class TestReportConverter {
    private configService = ConfigService;
    private xmlProcessor = XmlProcessor;

    /**
     * Process converted XML and optionally split by classname
     * @param {TestReportConverterOptions} options Converter configuration
     * @param {Promise<string>} xmlString Converted XML string
     * @returns Formatted XML string
     * @throws {Error} If XML formatting fails
     */
    private async processXml(options: ConverterOptions, xmlString: string): Promise<string> {
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

        if (options.testType !== 'trx' && !options.splitByClassname) {
            return parsedXml.replaceAll('&#xD;', '');
        } else {
            return this.xmlProcessor
                .processXml(options, parsedXml)
                .replaceAll('&amp;#xD;', '')
                .replaceAll('&amp;gt;', '&gt;')
                .replaceAll('&amp;lt;', '&lt;');
        }
    }

    /**
     * Convert test report to JUnit XML format
     * @param {TestReportConverterOptions} options Converter configuration
     * @returns {Promise<string>} Async formatted JUnit XML string
     * @throws {Error} If XSLT processing fails
     */
    private async convert(options: TestReportConverterOptions): Promise<string> {
        const config = this.configService.config(options);
        const xsltFile = `../xslt/${config.testType}-junit.xslt`;

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

        return await this.processXml(config, xml);
    }

    /**
     * Convert test report to JUnit XML and write to file async
     * @param options Converter configuration
     * @throws {Error} If conversion or file writing fails
     */
    async toFile(options: TestReportConverterOptions): Promise<void> {
        const config = this.configService.config(options);
        const result = await this.convert(options);
        const reportDir = config.reportDir || './report';
        const reportFile = config.reportFile || 'output.xml';
        fs.writeFileSync(path.join(reportDir, reportFile), result, 'utf8');
    }

    /**
     * Convert test report to JUnit XML string
     * @param options Converter configuration
     * @returns {Promise<string>} Async formatted JUnit XML string
     * @throws {Error} If conversion fails
     */
    async toString(options: TestReportConverterOptions): Promise<string> {
        return await this.convert(options);
    }

    /**
     * Convert test report to JUnit and parse as JSON object
     * @param {TestReportConverterOptions} options Converter configuration
     * @returns {Promise<TestSuites>} Async parsed JSON object
     * @throws {Error} If conversion or JSON parsing fails
     */
    async toJson(options: TestReportConverterOptions): Promise<TestSuites> {
        const xmlParserOptions: XmlParserOptions = {
            object: true,
            arrayNotation: true,
            sanitize: false,
            reversible: true,
        };

        const str = await this.toString(options);

        try {
            return parser.toJson(str, xmlParserOptions) as TestSuites;
        } catch (e) {
            throw new Error(
                `Could not parse JSON from converted XML ${options.testFile}.\n ${
                    e instanceof Error ? e.message : String(e)
                }`
            );
        }
    }
}

// Create singleton instance for backward compatibility
const converter = new TestReportConverter();

// Export instance methods for backward compatibility
export const toFile = (options: TestReportConverterOptions): Promise<void> => converter.toFile(options);
export const toString = (options: TestReportConverterOptions): Promise<string> => converter.toString(options);
export const toJson = (options: TestReportConverterOptions): Promise<TestSuites> => converter.toJson(options);

// Default export for CommonJS consumers
export default {
    toFile,
    toString,
    toJson,
    TestReportConverter,
};

