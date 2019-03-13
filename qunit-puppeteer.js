// const map = require("map-stream");
// const gutil = require("gulp-util");
const fs = require("fs");
const path = require("path");
// const Vinyl = require("vinyl");
const hashCode = require("string-hash");
const prepareOptions = require("./prepare-options");
const buildHtml = require("./build-html");
// const run = require("./test-run");
// const buildXml = require("./build-xml");
const glob = require("glob");
const puppeteer = require("puppeteer");
const xmlescape = require("xml-escape");

const initialise = async function (globString, options) {
    let files = [];
    try {
        files = await new Promise((resolve, reject) => {
            glob(globString, null, (er, files) => {
                if (er) {
                    reject(er);
                } else {
                    resolve(files);
                }
            });
        });
    } catch (e) {
        console.error(e);
        return false;
    }

    const { consolePassthrough, debug } = options;

    const suites = [];
    
    for (const file of files) {
        suites.push(createSuite(file, options));
    }

    return async function run(suiteName) {
        if (suiteName) {
            const suite = suites.find(s => s.file === suiteName);
            if (suite) {
                const results = await runTests([suite], consolePassthrough, debug);
                fs.unlinkSync(suites[suiteName].html);
                return results;
            }

            throw `Suite "${suite}" does not exist`
        }

        const results = await runTests(suites, consolePassthrough, debug);
        for (const suite of suites) {
            fs.unlinkSync(suite.html);
        }
        
        return results;
    }
};

const compileXml = function (testResults) {
    function writeFailure(testResult) {
        if (testResult.failed === 0) {
            return "";
        }

        return `\n\t\t\t<failure message="${xmlescape(testResult.assertions[0].message)}"/>\n\t\t`;
    }
    
    function compile(runResults) {
        const suiteResults = runResults.map(({ file, overall, results }) =>
            `<testsuite name="${xmlescape(file)}" tests="${overall.total}" failures="${overall.failed}" errors="0" skipped="0" timestamp="${new Date().toGMTString()}" time="${overall.runtime}">
                ${results.map(r => `<testcase classname="${xmlescape(r.module)}" name="${xmlescape(r.name)}" time="${r.runtime}"${r.failed === 0 ? '/>' : '>'}${writeFailure(r)}${r.failed === 0 ? '' : '</testcase>'}`).join('\n\t\t')}
            </testsuite>`)
        
        return `<?xml version="1.0" encoding="UTF-8" ?>
            <testsuites>
                ${suiteResults}
            </testsuites>
        `;
    }
    
    return compile(Array.isArray(testResults) ? testResults : [testResults]);
};

const createSuite = (file, options) => {
    const suiteName = path.basename(file, path.extname(file));
    const { dependencies, htmlBody } = prepareOptions(options, suiteName);

    const htmlContent = buildHtml(dependencies[suiteName], file, htmlBody[suiteName]);

    const fileName = `${suiteName}-${hashCode(htmlContent)}`;
    fs.writeFileSync(fileName + ".html", htmlContent);

    return { file, html: path.resolve(fileName + ".html") };
};

const runTests = async function (suites, consolePassthrough, debug) {
    const browser = await puppeteer.launch({ devtools: !!debug });
    const page = await browser.newPage();

    if (debug) {
        // This is to wait for the browser window to open
        const delay = debug.delay || 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    if (consolePassthrough) {
        page.on("console", function (msg) {
            console.log(msg.text());
        });
    }

    const testResults = [];
    for (const suite of suites) {
        const html = suite.html;
        await page.goto("file://" + html);

        const { overall, results } = await page.evaluate("runTests()");
        testResults.push({ file: suite.file, overall, results });
    }

    await browser.close();
    return testResults;
};

module.exports = { initialise, compileXml };