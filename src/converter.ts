import * as fs from 'fs';
import * as path from 'path';
import xmlFormat from 'xml-formatter';
import { XmlConverter } from './xmlConverter.js';
import { ConfigService } from './config.js';
import { TestReportConverterOptions, XmlParserOptions, TestSuites, ConverterOptions } from './interfaces.js';
import { CtrfConverter } from './ctrfConverter.js';

import {toJson as xmlToJson, toXml as jsonToXml} from 'p3x-xml2json';

/**
 * Main converter service for test reports to JUnit XML
 */
export class Converter {

    private xmlParserOptions: XmlParserOptions = {
        object: true,
        arrayNotation: true,
        sanitize: false,
        reversible: true,
    };

    private xmlFormatterOptions = { forceSelfClosingEmptyTag: true };

    private formatXml(options: ConverterOptions, xml: string): string {
        return options.minify
            ? xmlFormat.minify(xml, this.xmlFormatterOptions)
            : xmlFormat(xml, this.xmlFormatterOptions);
    }

    /**
     * Convert test report to JUnit XML and write to file async
     * @param options Converter configuration
     * @throws {Error} If conversion or file writing fails
     */
    async toFile(options: TestReportConverterOptions): Promise<void> {
        const config = ConfigService.config(options);
        let result;
        if(config.testType === 'ctrf'){
            this.xmlParserOptions.sanitize = true;
            let xml = jsonToXml(CtrfConverter.convert(config), this.xmlParserOptions);
            result = this.formatXml(config, xml);
        }
        else{
            result = await XmlConverter.convert(config);
        }
        fs.writeFileSync(path.join(config.reportDir, config.reportFile), result, 'utf8');
    }

    /**
     * Convert test report to JUnit XML string
     * @param options Converter configuration
     * @returns {Promise<string>} Async formatted JUnit XML string
     * @throws {Error} If conversion fails
     */
    async toString(options: TestReportConverterOptions): Promise<string> {
        const config = ConfigService.config(options);
        let result;
        if(config.testType === 'ctrf'){
            this.xmlParserOptions.sanitize = true;
            let xml = jsonToXml(CtrfConverter.convert(config), this.xmlParserOptions);
            result = this.formatXml(config, xml);
        }
        else{
            result = await XmlConverter.convert(config);
        }
        return result;
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

        if (options.testType === 'ctrf') {
            const config = ConfigService.config(options);
            return CtrfConverter.convert(config);
        }
        else{
            const str = await this.toString(options);

            try {
                return xmlToJson(str, xmlParserOptions) as TestSuites;
            } catch (e) {
                throw new Error(
                    `Could not parse JSON from converted XML ${options.testFile}.\n ${
                        e instanceof Error ? e.message : String(e)
                    }`
                );
            }
        }

    }
}

// Create singleton instance for backward compatibility
const converter = new Converter();

// Export instance methods for backward compatibility
export const toFile = (options: TestReportConverterOptions): Promise<void> => converter.toFile(options);
export const toString = (options: TestReportConverterOptions): Promise<string> => converter.toString(options);
export const toJson = (options: TestReportConverterOptions): Promise<TestSuites> => converter.toJson(options);

// Default export for CommonJS consumers
export default {
    toFile,
    toString,
    toJson,
    Converter: Converter,
};
