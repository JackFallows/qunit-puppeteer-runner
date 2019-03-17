#!/usr/bin/env node

const { initialise, logResults, compileXml } = require("./qunit-puppeteer");

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

const debug = !!findOption("debug");

// console.log(source);
// console.log(debug);

const run = initialise(source.value, {
    debug
});

run().then(results => {
    logResults(results);
}).catch(err => console.error(err));