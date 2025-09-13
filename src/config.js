const path = require('path');
const fs = require('fs');

const TestType = {
  junit: 'junit',
  nunit: 'nunit',
  xunit: 'xunit',
  trx: 'trx'
};

/**
 * @param {{testFile: string, testType: string, reportFilename: string}} options
 * @returns {ConverterOptions}
 */
function config (options) {

  if(!options) {
    throw "options are required.";
  }

  if(!options.testFile) {
    throw "Option 'testFile' is required.";
  }
  if(!fs.existsSync(options.testFile)) {
    throw `Could not find file ${options.testFile}.`;
  }

  let testFile = options.testFile;

  if(!options.testType){
    throw "Option 'testType' is required.";
  }
  if(!TestType.hasOwnProperty(options.testType.toLowerCase())){
    throw `Test type '${options.testType}' is not supported.`;
  }

  let testType = options.testType.toLowerCase();

  let skippedAsPending = true;
  let reportDir = './report';
  let reportFile = `${path.parse(options.testFile).name}-junit.xml`;
  let saveIntermediateFiles = false;
  let splitByClassname = false;
  let minify = false;

  if(options.splitByClassname === true || options.splitByClassname === 'true'){
    splitByClassname = true;
  }

  if(options.saveIntermediateFiles === true || options.saveIntermediateFiles === 'true'){
    saveIntermediateFiles = true;
  }

  if(options.minify === true || options.minify === 'true'){
    minify = true;
  }

  if(options.reportDir){
    reportDir = options.reportDir;
  }

  if(options.reportFilename){
    reportFile = options.reportFilename;
  }

  if(options.reportFile){
    reportFile = options.reportFile;
  }

  if(!fs.existsSync(reportDir)){
    fs.mkdirSync(reportDir, { recursive: true });
  }

  return{
    testFile: testFile,
    testType: testType,
    skippedAsPending: skippedAsPending,
    reportDir: reportDir,
    reportPath: path.join(reportDir, reportFile),
    reportFile: reportFile,
    splitByClassname: splitByClassname,
    minify: minify,
    saveIntermediateFiles: saveIntermediateFiles,
  }
}

module.exports = {config, TestType}