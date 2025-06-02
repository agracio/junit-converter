interface TestReportConverterOptions {
    testFile: string
    testType: string
    reportDir? : string
    reportFilename? : string
    switchClassnameAndName?: boolean
    splitByClassname?: boolean
    saveIntermediateFiles?: boolean
}

declare function convert(options: TestReportConverterOptions): Promise<void>;

export default convert;

