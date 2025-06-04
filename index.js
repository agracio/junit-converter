const converter = require('./src/converter');
const parser = require('p3x-xml2json');
const {join} = require("node:path");
const path = require("path");
const fs = require("fs");

// let options={
//     testFile: 'C:\\Users\\anton\\Dev\\test\\nunit3.xml',
//     testType: 'nunit',
//     junit: true,
//     html: true,
//     junitReportFilename: 'nunit3-junit-new.xml'
// }
//
// let options={
//     testFile: 'C:\\Users\\anton\\Dev\\test\\xunit2.xml',
//     testType: 'xunit',
//     junit: true,
//     html: true,
//     saveIntermediateFiles:false
// }


// let options={
//     testFile: 'C:\\Users\\anton\\Dev\\trx2junit\\tests\\trx2junit.Core.Tests\\data\\junit\\jenkins-style.xml',
//     testType: 'junit',
//     html: true,
//     reportFilename: 'junit-jenkins-mochawesome.json',
//     saveIntermediateFiles:false
// }

// let options={
//     testFile: 'C:\\Users\\anton\\Dev\\test\\mocha-xunit.xml',
//     testType: 'junit',
//     html: true,
//     saveIntermediateFiles:true,
//     reportFilename: 'junit-mocha-xunit-mochawesome.json'
// }

let dir = './tests/data/source';

let trxTests = [
    // 'trx-mstest-ignore.trx',
    // 'trx-nunit-ignore.trx',
    // 'trx-xunit-ignore.trx',
    // 'trx-mstest-datadriven.trx',
    // 'trx-nunit-datadriven.trx',
    // 'trx-xunit-datadriven.trx',
    // 'trx-mstest.trx',
    // 'trx-nunit.trx',
    // 'trx-xunit.trx',
    // 'trx-sample.trx',
    'trx-properties.trx',
];

let junitTests = [
    // 'junit-jenkins.xml',
    // 'junit-mocha-xunit.xml',
    // 'junit-notestsuites.xml',
    // 'junit-testsuites-noattributes.xml',
    // 'junit-nested.xml',
    'junit-qlnet.xml',
];


let nunitTests = [
    'nunit-short.xml',
    'nunit-mudblazor.xml',
    'nunit-sample.xml',
    'nunit-errors.xml',
];
let xunitTests = [
    'xunit-qlnet.xml',
    'xunit-sample.xml',
];
function generateFiles(files, type){
    files.forEach((file) => {
        let options={
            testFile: join(dir, file),
            testType: type,
            reportDir: 'tests/data/result',
            splitByClassname: true,
        }
        converter.toFile(options).then(() => console.log('done'));
    });
}

//generateFiles(trxTests, 'trx');
// generateFiles(nunitTests, 'nunit');
// generateFiles(xunitTests, 'xunit');
generateFiles(junitTests, 'junit');

// let options={
//     testFile: 'C:\\Users\\anton\\Dev\\trx2junit\\tests\\trx2junit.Core.Tests\\data\\trx\\mstest-ignore.trx',
//     testType: 'trx',
//     junit: true,
//     html: true,
//     reportFilename: 'trx-mstest-ignore-mochawesome.json',
//     saveIntermediateFiles:false
// }

// let options={
//     testFile: 'tests/data/source/nunit-short.xml',
//     testType: 'nunit',
//     junit: true,
//     html: true,
//     //reportFilename: 'trx-mstest-datadriven-mochawesome.json',
//     saveIntermediateFiles:false
// }

// let options={
//     //testFile: 'tests/data/source/junit-mocha-xunit.xml',
//     testFile: 'tests/data/source/junit-jenkins.xml',
//     //testFile: 'tests/data/source/xunit-qlnet.xml',
//     testType: 'junit',
//     html: false,
//     saveIntermediateFiles: false,
//     junit: true,
//     //reportFilename: 'trx-nunit-mochawesome.json'
// }
let options={
    //testFile: 'C:\\Users\\anton\\Dev\\MudBlazor\\TestOutput.xml',
    testFile: 'C:\\Users\\anton\\Dev\\test\\results-example-mstest.trx',
    //testFile: 'tests/data/source/xunit-multiple.xml',
    //testFile: 'tests/data/source/xunit-qlnet.xml',
    //testFile: 'tests/data/source/junit-notestsuites.xml',
    testType: 'trx',
    html: true,
    saveIntermediateFiles: false,
    junit: true,
    //reportFilename: 'junit-nested-mochawesome.json'
}

//convert(options).then(() => console.log(`Report created`));

//fs.writeFileSync('test.txt', 'This is an example with accents: é è à ','utf-8');


// 213291225
// 192012476

let xmlParserOptions = {
    object: true,
    // arrayNotation: true,
    sanitize: true,
    reversible: true,
}
const parser2 = require('json-xml-parse');
let json = parser.toJson(fs.readFileSync(path.join(__dirname, 'test.xml')), xmlParserOptions);

console.log(json);
// console.log(JSON.stringify(json, null, 2));

console.log(parser.toXml(json, xmlParserOptions))
// console.log()
// console.log(parser2.jsXml.toXmlString(json))




