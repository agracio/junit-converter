declare module 'junit-converter'{
    interface TestReportConverterOptions {
        testFile: string
        testType: string
        reportDir? : string
        reportFilename? : string
        switchClassnameAndName?: boolean
        splitByClassname?: boolean
        minify?: boolean
        saveIntermediateFiles?: boolean
    }

    function toFile(options: TestReportConverterOptions): Promise<void>;
    function toString(options: TestReportConverterOptions): Promise<string>;
    function toJson(options: TestReportConverterOptions): Promise<string>;
}


