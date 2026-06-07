"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convert = exports.XmlConverter = void 0;
const fs = __importStar(require("fs"));
const xml_formatter_1 = __importDefault(require("xml-formatter"));
const xsltProcessor = __importStar(require("xslt-processor"));
const path = __importStar(require("path"));
const junitXmlProcessor_js_1 = require("./junitXmlProcessor.js");
class XmlConverter {
    /**
     * Process converted XML and optionally split by classname
     * @param {ConverterOptions} options Converter configuration
     * @param {Promise<string>} xmlString Converted XML string
     * @returns Formatted XML string
     * @throws {Error} If XML formatting fails
     */
    static async processXml(options, xmlString) {
        let parsedXml;
        // Save intermediate XML if requested
        if (options.saveIntermediateFiles) {
            const fileName = `${path.parse(options.testFile).name}-converted.xml`;
            const reportDir = options.reportDir || './report';
            fs.writeFileSync(path.join(reportDir, fileName), xmlString, 'utf8');
        }
        try {
            parsedXml = options.minify
                ? xml_formatter_1.default.minify(xmlString, { forceSelfClosingEmptyTag: true })
                : (0, xml_formatter_1.default)(xmlString, { forceSelfClosingEmptyTag: true });
        }
        catch (e) {
            throw new Error(`\nXML parsed from ${options.testFile} is empty or invalid \n${e instanceof Error ? e.message : String(e)}`);
        }
        if (options.testType !== 'trx' && !options.splitByClassname) {
            return parsedXml.replaceAll('&#xD;', '');
        }
        else {
            return junitXmlProcessor_js_1.XmlProcessor
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
    static async convert(options) {
        const xsltFile = `../xslt/${options.testType}-junit.xslt`;
        const xsltString = fs.readFileSync(path.join(__dirname, xsltFile), 'utf8');
        const xmlString = fs.readFileSync(options.testFile, 'utf8');
        const xslt = new xsltProcessor.Xslt();
        const xmlParser = new xsltProcessor.XmlParser();
        let xml;
        try {
            xml = await xslt.xsltProcess(xmlParser.xmlParse(xmlString), xmlParser.xmlParse(xsltString));
        }
        catch (e) {
            throw new Error(`Could not process XML file ${options.testFile} using XSLT ${xsltFile} \n${e instanceof Error ? e.message : String(e)}`);
        }
        return await this.processXml(options, xml);
    }
}
exports.XmlConverter = XmlConverter;
exports.convert = XmlConverter.convert;
exports.default = { convert: exports.convert };
//# sourceMappingURL=xmlConverter.js.map