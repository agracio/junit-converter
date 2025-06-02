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
        reportFilename:`${path.parse(file).name}-junit.xml`,
        saveIntermediateFiles: saveIntermediateFiles,
    }
}

/**
 * @param {TestReportConverterOptions} options
 * @param {string?} reportFilename
 */
function compare(options){

    let junitCreatedReport = fs.readFileSync(path.join(outDir, options.reportFilename), 'utf8').replaceAll('\r', '');
    let junitReport = fs.readFileSync(path.join(reportDir, options.reportFilename), 'utf8').replaceAll('\r', '');

    expect(junitCreatedReport).toBe(junitReport);
}

exports.outDir = outDir;
exports.createOptions = createOptions;
exports.compare = compare;
exports.removeTempDir = removeTempDir;
