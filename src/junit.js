const fs = require('fs');
const path = require('path');
const parser = require('p3x-xml2json');
const xmlFormat = require('xml-formatter');
const _ = require('lodash');

/**
* @param {ConverterOptions} options
* @param {any} json
* @returns {any}
*/
function sortByClassname(options, json){

    json.testsuites[0].testsuite[0].testcase = _.sortBy(json.testsuites[0].testsuite[0].testcase, ['classname' ,'name']);

    let classnames = _.map(json.testsuites[0].testsuite[0].testcase, 'classname')
        .filter((value, index, array) => array.indexOf(value) === index);

    classnames = _.sortBy(classnames, [function(o) { return o; }]);

    let time = _.sumBy(json.testsuites[0].testsuite, suite => _.sumBy(suite.testcase, function(testCase) { return Number(testCase.time); }));

    json.testsuites[0].time = time;
    json.testsuites[0].testsuite[0].time = time;

    if(classnames.length > 1){

        let testSuites = [];
        classnames.forEach((classname) =>  {

            let testcases = _.filter(json.testsuites[0].testsuite[0].testcase, { 'classname': classname});
            let time = _.sumBy(testcases, function(testCase) { return Number(testCase.time); });
            const failures = testcases.filter((testCase) => testCase.status === 'Failed').length;
            const skipped = testcases.filter((testCase) => testCase.status === 'Skipped').length;

            testSuites.push(
                {
                    name: classname,
                    tests: `${testcases.length}`,
                    failures: `${failures}`,
                    skipped: `${skipped}`,
                    time: `${time}`,
                    testcase: testcases,
                }
            );
        });

        json.testsuites[0].testsuite = testSuites;
    }

    else{
        json.testsuites[0].testsuite[0].time = time;
        json.testsuites[0].testsuite[0].name = json.testsuites[0].testsuite[0].testcase[0].classname;
    }

    return json;
}

/**
 * @param {ConverterOptions} options
 * @param {string} xml
 * @returns {string}
 */
function processXml(options, xml){

    let xmlParserOptions = {
        object: true,
        arrayNotation: true,
        sanitize: false,
        reversible: true,
    }

    let json;

    try{
        json = parser.toJson(xml, xmlParserOptions);
    }
    catch (e){
        throw `Could not parse JSON from converted XML ${options.testFile}.\n ${e.message}`;
    }

    if((json && json.testsuites && json.testsuites.length && json.testsuites.length === 0)
        || (!json
            || !json.testsuites
            || !json.testsuites.length
            || !json.testsuites[0].testsuite
            || !json.testsuites[0].testsuite.length
            || json.testsuites[0].testsuite.length === 0)

    ){
        console.warn('No test suites found, skipping JUnit file creation.');
        return null;
    }

    if(options.saveIntermediateFiles){
        let fileName = `${path.parse(options.testFile).name}-converted.json`;
        fs.writeFileSync(path.join(options.reportDir, fileName), JSON.stringify(json, null, 2), 'utf8');
    }

    // sort test suites
    if(json.testsuites[0].testsuite[0].file && json.testsuites[0].testsuite[0].name){
        json.testsuites[0].testsuite = _.sortBy(json.testsuites[0].testsuite, ['file', 'name'])
    }
    else if(json.testsuites[0].testsuite[0].name){
        json.testsuites[0].testsuite = _.sortBy(json.testsuites[0].testsuite, ['name'])
    }

    json = sortByClassname(options, json);
    xmlParserOptions.sanitize = true;
    return options.minify ? xmlFormat.minify(parser.toXml(json, xmlParserOptions), {forceSelfClosingEmptyTag: true}) : xmlFormat(parser.toXml(json, xmlParserOptions), {forceSelfClosingEmptyTag: true})
}

module.exports = {
    processXml
};