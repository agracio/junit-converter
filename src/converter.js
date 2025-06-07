const fs = require('fs');
const xmlFormat = require('xml-formatter');
const xsltProcessor = require('xslt-processor');
const parser = require('p3x-xml2json');
const path = require("path");
const junit = require('./junit');
const conf = require('./config');

/**
 * @param {ConverterOptions} options
 * @param {string} xmlString
 */

async function processXml(options, xmlString){
    let parsedXml;

    if(options.saveIntermediateFiles){
        let fileName =  `${path.parse(options.testFile).name}-converted.xml`;
        fs.writeFileSync(path.join(options.reportDir, fileName), xmlString, 'utf8');
    }

    try{
        parsedXml = options.minify ? xmlFormat.minify(xmlString, {forceSelfClosingEmptyTag: true}) : xmlFormat(xmlString, {forceSelfClosingEmptyTag: true})
    }
    catch (e) {
        throw `\nXML parsed from ${options.testFile} is empty or invalid \n${e.message}`;
    }

    if(options.testType !== 'trx' && !options.splitByClassname){
        return parsedXml.replaceAll('&#xD;', '');
    }
    else{
        return junit.processXml(options, parsedXml)
            .replaceAll('&amp;#xD;', '')
            .replaceAll('&amp;gt;', '&gt;')
            .replaceAll('&amp;lt;', '&lt;');
    }
}

/**
 * @param {ConverterOptions} options
 */
async function convert(options){

    let config = conf.config(options);
    let xsltFile =`${config.testType}-junit.xslt`

    let xsltString = fs.readFileSync(path.join(__dirname, xsltFile)).toString();
    let xmlString = fs.readFileSync(options.testFile).toString();

    const xslt = new xsltProcessor.Xslt();
    const xmlParser = new xsltProcessor.XmlParser();
    let xml;
    try{
        xml = await xslt.xsltProcess(xmlParser.xmlParse(xmlString), xmlParser.xmlParse(xsltString));
    }
    catch (e) {
        throw `Could not process XML file ${options.testFile} using XSLT ${xsltFile} \n${e.message}`;
    }

    return await processXml(config, xml);
}


/**
 * Convert test report to JUnit XML and write to file.
 *
 * @param {TestReportConverterOptions} options
 * @return {Promise<void>}
 */
async function toFile(options){

    let config = conf.config(options);
    let result = await convert(config);
    fs.writeFileSync(path.join(config.reportDir, config.reportFilename), result, 'utf8');
}

/**
 * Convert test report to JUnit XML string.
 *
 * @param {TestReportConverterOptions} options
 * @return {Promise<string>}
 */
async function toString(options){
    let config = conf.config(options);
    return await convert(config);
}

/**
 * Convert test report to JUnit JSON object.
 *
 * @param {TestReportConverterOptions} options
 * @return {Promise<Object>}
 */
async function toJson(options){

    let xmlParserOptions = {
        object: true,
        arrayNotation: true,
        sanitize: false,
        reversible: true,
    }

    let str =  await toString(options);

    try{
        return parser.toJson(str, xmlParserOptions);
    }
    catch (e){
        throw `Could not parse JSON from converted XML ${options.testFile}.\n ${e.message}`;
    }
}

module.exports = {
    toFile,
    toString,
    toJson
};