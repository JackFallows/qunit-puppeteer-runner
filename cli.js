#!/usr/bin/env node

const { initialise, logResults, compileXml } = require("./qunit-puppeteer-runner");

const [,, ...args] = process.argv;

function findKeyValuePair(key) {
    const index = args.findIndex(a => a === "-" + key);
    if (index >= 0) {
        const value = args[index + 1];
        return { key, value };
    }
    
    return { key };
}

function findOption(option) {
    return args.find(a => a === "--" + option);
}

const source = findKeyValuePair("source");
if (!source.value) {
    throw "Source must be provided";
}

const output = findKeyValuePair("output");

const debug = !!findOption("debug");
const consolePassthrough = !!findOption("consolePassthrough");

const globalDependencies = findKeyValuePair("globalDependencies");

const run = initialise(source.value, {
    debug,
    consolePassthrough,
    globalDependencies: globalDependencies.value ? JSON.parse(globalDependencies.value) : null
});

run().then(results => {
    logResults(results);
    
    if (output.value) {
        const fs = require("fs");
        fs.writeFileSync(output.value, compileXml(results));
    }
}).catch(err => console.error(err));