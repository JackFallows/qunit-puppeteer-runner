#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
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

const settingsJs = findKeyValuePair("settings");

let settings = null;
if (settingsJs.value) {
    const settingsPath = settingsJs.value;
    const localSettingsPath = path.join(process.cwd(), settingsPath);
    const globalSettingsPath = path.join(__dirname, settingsPath);

    const pathToSettings = fs.existsSync(localSettingsPath)
        ? localSettingsPath
        : globalSettingsPath;

    settings = require(pathToSettings);
}

const run = initialise(source.value, {
    ...settings,
    ...{
        debug,
        consolePassthrough
    }
});

run().then(results => {
    logResults(results);
    
    if (output.value) {
        const fs = require("fs");
        fs.writeFileSync(output.value, compileXml(results));
    }
}).catch(err => console.error(err));