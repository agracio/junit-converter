/**
 * Configuration options for test report conversion
 */
export interface ConverterOptions {
    testFile: string;
    testType: string;
    reportDir?: string;
    reportPath: string;
    reportFile?: string;
    splitByClassname?: boolean;
    minify?: boolean;
    saveIntermediateFiles?: boolean;
    skippedAsPending?: boolean;
}
/**
 * User-provided options for converter
 */
export interface TestReportConverterOptions {
    testFile: string;
    testType: string;
    reportDir?: string;
    reportFilename?: string;
    reportFile?: string;
    splitByClassname?: boolean | string;
    saveIntermediateFiles?: boolean | string;
    minify?: boolean | string;
}
/**
 * Test types supported by the converter
 */
export enum TestType {
    JUNIT = "junit",
    NUNIT = "nunit",
    XUNIT = "xunit",
    TRX = "trx"
}
/**
 * XML Parser options
 */
export interface XmlParserOptions {
    object: boolean;
    arrayNotation: boolean;
    sanitize: boolean;
    reversible: boolean;
}
/**
 * Test suite JSON representation
 */
export interface TestSuite {
    name: string;
    tests: string;
    failures: string;
    skipped: string;
    time: string;
    testcase: TestCase[];
    file?: string;
}
/**
 * Test case JSON representation
 */
export interface TestCase {
    classname: string;
    name: string;
    time: number;
    status?: string;
    [key: string]: any;
}
/**
 * Test suites JSON structure
 */
export interface TestSuites {
    testsuites: Array<{
        time?: string | number;
        testsuite: TestSuite[];
    }>;
}
