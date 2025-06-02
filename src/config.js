const path = require('path');
const fs = require('fs');

const TestType = {
  junit: 'junit',
  nunit: 'nunit',
  xunit: 'xunit',
  trx: 'trx'
};

/**
 * @param {TestReportConverterOptions} options
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
  let switchClassnameAndName = false;
  let reportDir = './report';
  let reportFilename = `${path.parse(options.testFile).name}-junit.xml`;
  let saveIntermediateFiles = false;
  let splitByClassname = false;

  if(options.switchClassnameAndName === true || options.switchClassnameAndName === 'true'){
    switchClassnameAndName = true;
  }

  if(options.splitByClassname === true || options.splitByClassname === 'true'){
    splitByClassname = true;
  }

  if(options.saveIntermediateFiles === true || options.saveIntermediateFiles === 'true'){
    saveIntermediateFiles = true;
  }

  if(options.reportDir){
    reportDir = options.reportDir;
  }

  if(options.reportFilename){
    reportFilename = options.reportFilename;
  }

  if(!fs.existsSync(reportDir)){
    fs.mkdirSync(reportDir, { recursive: true });
  }

  return{
    testFile: testFile,
    testType: testType,
    skippedAsPending: skippedAsPending,
    switchClassnameAndName: switchClassnameAndName,
    reportDir: reportDir,
    reportPath: path.join(reportDir, reportFilename),
    reportFilename: reportFilename,
    splitByClassname: splitByClassname,
    saveIntermediateFiles: saveIntermediateFiles,
  }
}

module.exports = {config, TestType}