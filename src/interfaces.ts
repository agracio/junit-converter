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
 * JUnit JSON structure from XML
 */
export interface TestSuites {
    testsuites: Array<{
        name?: string;
        classname?: string;
        tests: string | number;
        failures: string | number;
        errors?: string | number;
        skipped: string | number;
        disabled?: string | number;
        assertions?: string | number;
        time: string | number;
        timestamp?: string;
        testsuite: TestSuite[];
    }>;
}

export interface TestSuite {
    name: string;
    classname?: string;
    file?: string;
    tests: string | number;
    passed?: string | number;
    failures: string | number;
    errors?: string | number;
    skipped: string | number;
    disabled?: string | number;
    time: string | number;
    timestamp?: string;
    testcase: TestCase[];
}

export interface TestCase {
    name: string;
    classname: string;
    status: string;
    time: string;
    failure?: any;
    error?: any;
    properties?: any;
    skipped?: any;
    'system-out'?: any;
    'system-err'?: any;
}
