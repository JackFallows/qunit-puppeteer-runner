const fs = require("fs");
const glob = require("glob");

const createSuite = require("./createSuite");
const compileXml = require("./compileXml");
const runTests = require("./runTests");

const initialise = function (globString, options) {
    let files = [];
    try {
        files = glob.sync(globString);
    } catch (e) {
        console.error(e);
        return false;
    }

    const { consolePassthrough, debug } = options;

    const suites = [];
    
    for (const file of files) {
        suites.push(createSuite(file, options));
    }

    async function run(suite) {
        if (suite) {
            const results = await runTests([suite], consolePassthrough, debug);
            fs.unlinkSync(suite.html);
            return results;
        }

        const results = await runTests(suites, consolePassthrough, debug);
        for (const suite of suites) {
            fs.unlinkSync(suite.html);
        }

        return results;
    }
    
    run.suites = suites;
    
    return run;
};



module.exports = { initialise, compileXml };