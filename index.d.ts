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
     * Test suite JSON representation
     */
    interface TestSuite {
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
    interface TestCase {
        classname: string;
        name: string;
        time: number;
        status?: string;
        [key: string]: any;
    }
    /**
     * Test suites JSON structure
     */
    interface TestSuites {
        testsuites: Array<{
            time?: string | number;
            testsuite: TestSuite[];
        }>;
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


