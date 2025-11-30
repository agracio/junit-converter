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
Object.defineProperty(exports, "__esModule", { value: true });
exports.testTypeEnum = exports.config = exports.ConfigService = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const interfaces_1 = require("./interfaces");
class ConfigService {
    static config(options) {
        if (!options) {
            throw new Error('options are required.');
        }
        if (!options.testFile) {
            throw new Error("Option 'testFile' is required.");
        }
        if (!fs.existsSync(options.testFile)) {
            throw new Error(`Could not find file ${options.testFile}.`);
        }
        const testFile = options.testFile;
        if (!options.testType) {
            throw new Error("Option 'testType' is required.");
        }
        const testTypeLower = options.testType.toLowerCase();
        if (!Object.values(interfaces_1.TestType).includes(testTypeLower)) {
            throw new Error(`Test type '${options.testType}' is not supported.`);
        }
        const testType = testTypeLower;
        let reportDir = './report';
        let reportFile = `${path.parse(options.testFile).name}-junit.xml`;
        let saveIntermediateFiles = false;
        let splitByClassname = false;
        let minify = false;
        if (options.splitByClassname === true || options.splitByClassname === 'true') {
            splitByClassname = true;
        }
        if (options.saveIntermediateFiles === true || options.saveIntermediateFiles === 'true') {
            saveIntermediateFiles = true;
        }
        if (options.minify === true || options.minify === 'true') {
            minify = true;
        }
        if (options.reportDir) {
            reportDir = options.reportDir;
        }
        if (options.reportFilename) {
            reportFile = options.reportFilename;
        }
        if (options.reportFile) {
            reportFile = options.reportFile;
        }
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        return {
            testFile,
            testType,
            skippedAsPending: true,
            reportDir,
            reportPath: path.join(reportDir, reportFile),
            reportFile,
            splitByClassname,
            minify,
            saveIntermediateFiles,
        };
    }
}
exports.ConfigService = ConfigService;
ConfigService.TestType = interfaces_1.TestType;
exports.config = ConfigService.config;
exports.testTypeEnum = ConfigService.TestType;
exports.default = { config: exports.config, TestType: ConfigService.TestType };
//# sourceMappingURL=config.js.map