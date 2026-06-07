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
exports.convert = exports.CtrfConverter = void 0;
const fs = __importStar(require("fs"));
const _ = __importStar(require("lodash"));
class CtrfConverter {
    static parseTests(report) {
        let suiteName = 'Root Suite';
        report.results.tests.forEach((test) => {
            if (test.suite && test.suite.length > 0) {
                if (typeof test.suite === 'string') {
                    suiteName = test.suite;
                }
                else if (Array.isArray(test.suite)) {
                    suiteName = test.suite.join(' > ');
                }
            }
            if (!this.suites[suiteName]) {
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
            if (test.status.toLowerCase() === 'failed') {
                this.suites[suiteName].failures = Number(this.suites[suiteName].failures) + 1;
            }
            else if (test.status.toLowerCase() === 'skipped') {
                this.suites[suiteName].skipped = Number(this.suites[suiteName].skipped) + 1;
            }
            else if (test.status.toLowerCase() === 'pending') {
                this.suites[suiteName].skipped = Number(this.suites[suiteName].skipped) + 1;
            }
            this.suites[suiteName].testcase.push({
                name: test.name,
                classname: suiteName,
                status: test.status.replace('pending', 'skipped'),
                time: String(Number(test.duration) / 1000),
                failure: test.status.toLowerCase() === 'failed' ? {
                    message: test.message,
                    trace: test.trace,
                } : undefined,
                skipped: test.status.toLowerCase() === 'skipped' || test.status.toLowerCase() === 'pending' ? {
                    message: test.message,
                    trace: test.trace,
                } : undefined,
            });
        });
    }
    static convert(options) {
        const report = JSON.parse(fs.readFileSync(options.testFile, 'utf8'));
        const duration = report.results.summary.duration
            ? Number(report.results.summary.duration) / 1000
            : _.sumBy(report.results.tests, function (test) {
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
        console.log(converted);
        return converted;
    }
}
exports.CtrfConverter = CtrfConverter;
CtrfConverter.suites = {};
exports.convert = CtrfConverter.convert;
exports.default = { convert: exports.convert };
//# sourceMappingURL=ctrfConverter.js.map