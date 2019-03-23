const path = require("path");
const fs = require("fs");
const glob = require("glob");
const hashCode = require("string-hash");

const compileXml = require("./compile-xml");
const runTests = require("./run-tests");
const prepareOptions = require("./prepare-options");
const buildHtml = require("./build-html");

const initialise = function (sources, options) {
    let files = [];
    try {
        files = glob.sync(sources);
    } catch (e) {
        console.error(e);
        return false;
    }

    const { consolePassthrough, debug } = (options || {});

    const suites = files.map(f => ({ name: path.basename(f, path.extname(f)), file: f }));

    async function run(suiteName) {
        const pathToQunit = path.join(__dirname, "node_modules/qunit/qunit/qunit.js");
        
        if (suiteName) {
            const suite = suites.find(s => s.name === suiteName);

            if (suite) {
                const { dependencies, htmlBody, qunitConfig } = prepareOptions(options, suiteName);

                const htmlContent = buildHtml(dependencies[suiteName], suite.file, htmlBody[suiteName], pathToQunit, qunitConfig);

                const fileName = `${suiteName}-${hashCode(htmlContent)}.html`;
                fs.writeFileSync(fileName, htmlContent);

                const results = await runTests([{
                    file: suite.file,
                    name: suite.name,
                    html: fileName
                }], consolePassthrough, debug);

                fs.unlinkSync(fileName);

                return results;
            }

            throw `Suite "${suiteName}" not found.`;
        }

        const suitesHtml = suites.map(suite => {
            const { dependencies, htmlBody, qunitConfig } = prepareOptions(options, suite.name);
            const htmlContent = buildHtml(dependencies[suite.name], suite.file, htmlBody[suite.name], pathToQunit, qunitConfig);
            const fileName = `${suite.name}-${hashCode(htmlContent)}.html`;
            fs.writeFileSync(fileName, htmlContent);

            return { file: suite.file, name: suite.name, html: fileName };
        });

        const results = await runTests(suitesHtml, consolePassthrough, debug);
        
        for (const suite of suitesHtml) {
            fs.unlinkSync(suite.html);
        }

        return results;
    }

    run.suites = suites.map(s => s.name);

    return run;
};

function logResults(results) {
    const lines = [];

    function writeLine(line) {
        lines.push(line);
    }
    
    function writeErrorLine(line) {
        // https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
        lines.push(`\x1b[31m${line}\x1b[0m`);
    }
    
    for (const result of results) {
        if (result.overall.failed > 0) {
            // errored
            writeErrorLine(`${result.suite} ${JSON.stringify(result.overall)}`);
            const failedTests = result.results.filter(r => r.failed > 0);
            for (const test of failedTests) {
                for (const assertion of test.assertions.filter(a => !a.result)) {
                    writeErrorLine(assertion.message);
                    if (test.module) {
                        writeErrorLine(`Module: ${test.module}`);
                    }
                    
                    if (test.name) {
                        writeErrorLine(`Test: ${test.name}`);
                    }
                    
                    if (test.source) {
                        writeErrorLine(test.source);
                    }
                }
            }
        } else {
            writeLine(`${result.suite} ${JSON.stringify(result.overall)}`);
        }
    }
    
    console.log(lines.join(require("os").EOL));
}

module.exports = { initialise, logResults, compileXml };