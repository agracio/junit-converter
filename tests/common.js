const path = require('path');
const fs = require("fs");

const reportDir= './tests/data/result';
const outDir= './tests/data/tmp';

function removeTempDir(){
    if(fs.existsSync(outDir)){
        fs.rmSync(outDir, { recursive: true, force: true });
    }
}

/**
 * @returns {TestReportConverterOptions}
 */
function createOptions(file, type, saveIntermediateFiles = false){
    if(!saveIntermediateFiles){
        saveIntermediateFiles = false;
    }
    return {
        testFile: path.join(__dirname, `data/source/${file}`),
        testType: type,
        reportDir: outDir,
        reportFile:`${path.parse(file).name}-junit.xml`,
        saveIntermediateFiles: saveIntermediateFiles,
    }
}

/**
 * @param {TestReportConverterOptions} options
 * @param {string} stringReport
 */
function compare(options, stringReport = undefined){

    let junitCreatedReport = fs.readFileSync(path.join(outDir, options.reportFile), 'utf8').replaceAll('\r', '');
    let junitReport = fs.readFileSync(path.join(reportDir, options.reportFile), 'utf8').replaceAll('\r', '');

    expect(junitCreatedReport).toBe(junitReport);
    if(stringReport){
        console.log(stringReport)
        expect(stringReport).toBe(junitReport);
    }
}

exports.outDir = outDir;
exports.createOptions = createOptions;
exports.compare = compare;
exports.removeTempDir = removeTempDir;
