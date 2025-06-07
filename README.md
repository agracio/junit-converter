## Test report files to JUnit converter

[![Actions Status][github-img]][github-url]
[![Git Issues][issues-img]][issues-url]
[![Closed Issues][closed-issues-img]][closed-issues-url]

[//]: # ([![Codacy Badge][codacy-img]][codacy-url])

### Overview

- Convert test report files to JUnit format.

### Supported report formats

- JUnit/xUnit XML Format  
- NUnit v3+ XML Format  
- xUnit.net v2+ XML Format  
- MSTest TRX Format  

### Conversion process

 - All test reports are first converted to JUnit format using XSLT.
 - Any nested test suites are flattened.
 - TRX files undergo additional processing to enhance JUnit output.

### JUnit

- Flattens any nested test suites.

### NUnit

- NUnit v3+ XML is supported.
- Converts **&lt;properties&gt;** elements to JUnit **&lt;properties&gt;**.
- Converts **&lt;output&gt;** elements to JUnit **&lt;system-out&gt;**.
- Converts skipped `test-case` **&lt;reason&gt;** elements to JUnit **&lt;skipped&gt;** with message.
- Converts `test-case` **&lt;failure&gt;** elements to JUnit **&lt;failure&gt;** with message and stack trace.

### xUnit.net  

- xUnit.net v2+ XML is supported.
- Converts **&lt;traits&gt;** elements to  to JUnit **&lt;properties&gt;**.
- Converts skipped `test` **&lt;reason&gt;** elements to JUnit **&lt;skipped&gt;** with message.
- Converts `test` **&lt;failure&gt;** elements to JUnit **&lt;failure&gt;** with message and stack trace.
- Supports single **&lt;assembly&gt;** per file, if multiple assemblies are present only first will be converted.

### MSTest TRX

- Converts `Output/ErrorInfo/Message` to JUnit **&lt;failure&gt;** message.
- Converts `Output/ErrorInfo/StackTrace` to JUnit **&lt;failure&gt;** stack trace.
- Converts `Output/StdErr` to JUnit **&lt;system-err&gt;**.
- Converts `Output/StdOut` to JUnit **&lt;system-out&gt;**.
- Converts Inconclusive and NotExecuted tests to **&lt;skipped&gt;** with message.
- Tests are split into multiple **&lt;testsuite&gt;** elements by test classname.
- Tests are ordered by name.
- Test suit times are not 100% accurate - displayed as a sum() of all test times. 

### Usage

```bash
npm i --save-dev junit-converter
```

```js
const converter = require('junit-converter');

let options = {
    testFile: 'mytesfiles/nunit.xml',
    testType: 'nunit'
}

// Convert test report to JUnit format and save to file
// Set minify:true to save minified XML
converter.toFile(options).then(() => console.log(`JUnit report created`));

// Convert test report to JUnit format and return as 'pretty' XML string
// Set minify:true to returm minified XML string
converter.toString(options).then((result) =>{/*do something with result*/});

// Convert test report to JUnit format and return as JSON object for processing
converter.toJson(options).then((result) =>{/*do something with result*/});
```

### CLI usage

```bash
npm i -g junit-converter
```

```bash
junit-converter --testFile mytests/nunit.xml --testType nunit
```

### Options

| Option                    | Type    | Default                   | Description                                                                                     |
|:--------------------------|:--------|:--------------------------|:------------------------------------------------------------------------------------------------|
| `testFile` **(required)** | string  |                           | Path to test file for conversion                                                                |
| `testType` **(required)** | string  |                           | [Test report type](https://github.com/agracio/mochawesome-converter#supported-testtype-options) |
| `reportDir`               | string  | ./report                  | Converted report output path when saving file                                                   |
| `reportFilename`          | string  | `testFile.name`-junit.xml | JUnit report name  when saving file                                                             |
| `splitByClassname`        | boolean | false                     | Split into multiple test suites by test classname                                               |
| `minify`                  | boolean | false                     | Minify XML result                                                                               |

- `testFile` - relative or absolute path to input test file.
- `testType` - type of test report, not case-sensitive.
- `reportDir` - will be created if path does not exist. Only used when saving to file.
- `reportFilename` - JUnit file name. Only used when saving to file.
- `splitByClassname` - If true, splits test cases into multiple test suites by classname.  
  This is useful for test runners that generate tests under a single test suite such as `dotnet test` when using JUnit loggers.  
  Should only be set to true if test report file contains single test suite.
  TRX report files are always split by classname, so this option is ignored for TRX files.

#### Supported `testType` options.

| `testType` | File Type         |
|:-----------|:------------------|
| JUnit      | JUnit/xUnit XML   |
| NUnit      | NUnit v3+ XML     |
| xUnit      | xUnit.net v2+ XML |
| TRX        | MSTest TRX        |


[issues-img]: https://img.shields.io/github/issues-raw/agracio/junit-converter.svg?style=flat-square
[issues-url]: https://github.com/agracio/junit-converter/issues
[closed-issues-img]: https://img.shields.io/github/issues-closed-raw/agracio/junit-converter.svg?style=flat-square&color=brightgreen
[closed-issues-url]: https://github.com/agracio/junit-converter/issues?q=is%3Aissue+is%3Aclosed

[codacy-img]: https://app.codacy.com/project/badge/Grade/1b8b8f9fdbce4267bf779197141657a2
[codacy-url]: https://app.codacy.com/gh/agracio/junit-converter/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade

[github-img]: https://github.com/agracio/junit-converter/workflows/Test/badge.svg
[github-url]: https://github.com/agracio/edge-js/junit-converter/workflows/main.yml

