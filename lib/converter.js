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
exports.toJson = exports.toString = exports.toFile = exports.Converter = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const xml_formatter_1 = __importDefault(require("xml-formatter"));
const xmlConverter_js_1 = require("./xmlConverter.js");
const config_js_1 = require("./config.js");
const ctrfConverter_js_1 = require("./ctrfConverter.js");
const p3x_xml2json_1 = require("p3x-xml2json");
/**
 * Main converter service for test reports to JUnit XML
 */
class Converter {
    constructor() {
        this.xmlParserOptions = {
            object: true,
            arrayNotation: true,
            sanitize: false,
            reversible: true,
        };
        this.xmlFormatterOptions = { forceSelfClosingEmptyTag: true };
    }
    formatXml(options, xml) {
        return options.minify
            ? xml_formatter_1.default.minify(xml, this.xmlFormatterOptions)
            : (0, xml_formatter_1.default)(xml, this.xmlFormatterOptions);
    }
    /**
     * Convert test report to JUnit XML and write to file async
     * @param options Converter configuration
     * @throws {Error} If conversion or file writing fails
     */
    async toFile(options) {
        const config = config_js_1.ConfigService.config(options);
        let result;
        if (config.testType === 'ctrf') {
            this.xmlParserOptions.sanitize = true;
            let xml = (0, p3x_xml2json_1.toXml)(ctrfConverter_js_1.CtrfConverter.convert(config), this.xmlParserOptions);
            result = this.formatXml(config, xml);
        }
        else {
            result = await xmlConverter_js_1.XmlConverter.convert(config);
        }
        fs.writeFileSync(path.join(config.reportDir, config.reportFile), result, 'utf8');
    }
    /**
     * Convert test report to JUnit XML string
     * @param options Converter configuration
     * @returns {Promise<string>} Async formatted JUnit XML string
     * @throws {Error} If conversion fails
     */
    async toString(options) {
        const config = config_js_1.ConfigService.config(options);
        let result;
        if (config.testType === 'ctrf') {
            this.xmlParserOptions.sanitize = true;
            let xml = (0, p3x_xml2json_1.toXml)(ctrfConverter_js_1.CtrfConverter.convert(config), this.xmlParserOptions);
            result = this.formatXml(config, xml);
        }
        else {
            result = await xmlConverter_js_1.XmlConverter.convert(config);
        }
        return result;
    }
    /**
     * Convert test report to JUnit and parse as JSON object
     * @param {TestReportConverterOptions} options Converter configuration
     * @returns {Promise<TestSuites>} Async parsed JSON object
     * @throws {Error} If conversion or JSON parsing fails
     */
    async toJson(options) {
        const xmlParserOptions = {
            object: true,
            arrayNotation: true,
            sanitize: false,
            reversible: true,
        };
        if (options.testType === 'ctrf') {
            const config = config_js_1.ConfigService.config(options);
            return ctrfConverter_js_1.CtrfConverter.convert(config);
        }
        else {
            const str = await this.toString(options);
            try {
                return (0, p3x_xml2json_1.toJson)(str, xmlParserOptions);
            }
            catch (e) {
                throw new Error(`Could not parse JSON from converted XML ${options.testFile}.\n ${e instanceof Error ? e.message : String(e)}`);
            }
        }
    }
}
exports.Converter = Converter;
// Create singleton instance for backward compatibility
const converter = new Converter();
// Export instance methods for backward compatibility
const toFile = (options) => converter.toFile(options);
exports.toFile = toFile;
const toString = (options) => converter.toString(options);
exports.toString = toString;
const toJson = (options) => converter.toJson(options);
exports.toJson = toJson;
// Default export for CommonJS consumers
exports.default = {
    toFile: exports.toFile,
    toString: exports.toString,
    toJson: exports.toJson,
    Converter: Converter,
};
//# sourceMappingURL=converter.js.map