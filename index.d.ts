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
     * Convert test report to JUnit XML and write to file.
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
     * Convert test report to JUnit JSON object.
     *
     * @param {TestReportConverterOptions} options
     * @return {Promise<object>}
     */
    function toJson(options: TestReportConverterOptions): Promise<object>;
}


