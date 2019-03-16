const path = require("path");
const fs = require("fs");
const glob = require("glob");
const hashCode = require("string-hash");

const compileXml = require("./compileXml");
const runTests = require("./runTests");
const prepareOptions = require("./prepareOptions");
const buildHtml = require("./buildHtml");

const initialise = function (globString, options) {
    let files = [];
    try {
        files = glob.sync(globString);
    } catch (e) {
        console.error(e);
        return false;
    }

    const { consolePassthrough, debug } = options;

    const suites = files.map(f => ({ name: path.basename(f, path.extname(f)), file: f }));
    
    async function run(suiteName) {
        if (suiteName) {
            const suite = suites.find(s => s.name === suiteName);
            
            if (suite) {
                const { dependencies, htmlBody } = prepareOptions(options, suiteName);
    
                const htmlContent = buildHtml(dependencies[suiteName], suite.file, htmlBody[suiteName]);
    
                const fileName = `${suiteName}-${hashCode(htmlContent)}.html`;
                fs.writeFileSync(fileName, htmlContent);
                
                const results = await runTests([{ file: suite.file, name: suite.name, html: fileName }], consolePassthrough, debug);
                
                fs.unlinkSync(fileName);
                
                return results;
            }
            
            throw `Suite "${suiteName}" not found.`;
        }

        const suitesHtml = suites.map(suite => {
            const { dependencies, htmlBody } = prepareOptions(options, suite.name);
            const htmlContent = buildHtml(dependencies[suite.name], suite.file, htmlBody[suite.name]);
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
    
    run.suites = suites;
    
    return run;
};

function logResults(result) {
    if (result.overall.failed > 0) {
        // errored
        console.error(result.suite, result.overall);
    } else {
        console.log(result.suite, result.overall);
    }
}

module.exports = { initialise, logResults, compileXml };