import * as fs from 'fs';
import xmlFormat from 'xml-formatter';
import * as xsltProcessor from 'xslt-processor';
import * as path from 'path';
import { XmlProcessor } from './junitXmlProcessor.js';
import { ConverterOptions} from './interfaces.js';

export class XmlConverter {

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

        if (options.testType !== 'trx' && !options.splitByClassname) {
            return parsedXml.replaceAll('&#xD;', '');
        } else {
            return XmlProcessor
                .processXml(options, parsedXml)
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

export const convert = XmlConverter.convert;

export default { convert };