#!/usr/bin/env node

const yargs = require('yargs');
const { yargsOptions } = require('./options');
const { hideBin } = require('yargs/helpers');
const { config } = require('../lib/config');
const convert = require('../lib/converter');

const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .example('$0 --testFile mytesfiles/nunit.xml --testType nunit', '')
    .demandOption(['testFile','testType'])
    .options(yargsOptions)
    .help('help')
    .alias('h', 'help')
    .version().argv;

const options = (config(argv));
convert.toFile(argv).then(() => console.log(`Report created at '${options.reportDir}/${options.reportFile}'`));

