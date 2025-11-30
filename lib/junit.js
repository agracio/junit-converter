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
exports.processXml = exports.XmlProcessor = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const xml_formatter_1 = __importDefault(require("xml-formatter"));
const _ = __importStar(require("lodash"));
const parser = require('p3x-xml2json');
/**
 * Service class for XML processing and formatting
 */
class XmlProcessor {
    /**
     * Sort test cases by classname and restructure test suites
     * @param options Converter configuration
     * @param json Parsed test suites JSON
     * @returns Modified JSON with sorted test cases
     */
    static sortByClassname(options, json) {
        if (!json?.testsuites?.[0]?.testsuite?.[0]?.testcase) {
            return json;
        }
        // Sort test cases by classname and name
        json.testsuites[0].testsuite[0].testcase = _.sortBy(json.testsuites[0].testsuite[0].testcase, ['classname', 'name']);
        // Extract unique classnames
        let classnames = _.map(json.testsuites[0].testsuite[0].testcase, 'classname')
            .filter((value, index, array) => array.indexOf(value) === index);
        classnames = _.sortBy(classnames, (o) => o);
        // Calculate total time
        const time = _.sumBy(json.testsuites[0].testsuite, (suite) => _.sumBy(suite.testcase, (testCase) => Number(testCase.time)));
        json.testsuites[0].time = time;
        json.testsuites[0].testsuite[0].time = String(time);
        if (classnames.length > 1) {
            const testSuites = classnames.map((classname) => {
                const testcases = _.filter(json.testsuites[0].testsuite[0].testcase, {
                    classname,
                });
                const suiteTime = _.sumBy(testcases, (testCase) => Number(testCase.time));
                const failures = testcases.filter((testCase) => testCase.status === 'Failed').length;
                const skipped = testcases.filter((testCase) => testCase.status === 'Skipped').length;
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
        }
        else {
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
    static processXml(options, xml) {
        const xmlParserOptions = {
            object: true,
            arrayNotation: true,
            sanitize: false,
            reversible: true,
        };
        let json;
        try {
            json = parser.toJson(xml, xmlParserOptions);
        }
        catch (e) {
            throw new Error(`Could not parse JSON from converted XML ${options.testFile}.\n ${e instanceof Error ? e.message : String(e)}`);
        }
        // Validate that test suites exist
        if (!json?.testsuites?.length ||
            !json.testsuites[0]?.testsuite?.length) {
            console.warn('No test suites found, skipping JUnit file creation.');
            return null;
        }
        // Save intermediate JSON if requested
        if (options.saveIntermediateFiles) {
            const fileName = `${path.parse(options.testFile).name}-converted.json`;
            const reportDir = options.reportDir || './report';
            fs.writeFileSync(path.join(reportDir, fileName), JSON.stringify(json, null, 2), 'utf8');
        }
        // Sort test suites
        if (json.testsuites[0].testsuite[0].file && json.testsuites[0].testsuite[0].name) {
            json.testsuites[0].testsuite = _.sortBy(json.testsuites[0].testsuite, ['file', 'name']);
        }
        else if (json.testsuites[0].testsuite[0].name) {
            json.testsuites[0].testsuite = _.sortBy(json.testsuites[0].testsuite, ['name']);
        }
        // Apply classname sorting if configured
        json = this.sortByClassname(options, json);
        // Convert back to XML and format
        xmlParserOptions.sanitize = true;
        const xmlOutput = parser.toXml(json, xmlParserOptions);
        return options.minify
            ? xml_formatter_1.default.minify(xmlOutput, { forceSelfClosingEmptyTag: true })
            : (0, xml_formatter_1.default)(xmlOutput, { forceSelfClosingEmptyTag: true });
    }
}
exports.XmlProcessor = XmlProcessor;
exports.processXml = XmlProcessor.processXml;
exports.default = { processXml: exports.processXml };
//# sourceMappingURL=junit.js.map