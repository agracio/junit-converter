declare module 'junit-converter'{
    interface TestReportConverterOptions {
        testFile: string
        testType: string
        reportDir? : string
        /**
         * @deprecated Use reportFile instead.
         */
        reportFilename? : string
        reportFile? : string
        splitByClassname?: boolean
        minify?: boolean
        saveIntermediateFiles?: boolean
    }

    /**
     * JUnit JSON structure from XML
     */
    interface TestSuites {
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

    interface TestSuite {
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

    interface TestCase {
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

    /**
     * Convert test report to JUnit XML and write to file async.
     *
     * @param {TestReportConverterOptions} options
     * @return {Promise<void>}
     */
    function toFile(options: TestReportConverterOptions): Promise<void>;

    /**
     * Convert test report to JUnit XML string.
     *
     * @param {TestReportConverterOptions} options
     * @return {Promise<string>}
     */
    function toString(options: TestReportConverterOptions): Promise<string>;

    /**
     * Convert test report to JUnit XML and parse as JSON object.
     *
     * @param {TestReportConverterOptions} options
     * @return {Promise<object>}
     */
    function toJson(options: TestReportConverterOptions): Promise<TestSuites>;
}