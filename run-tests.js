const puppeteer = require("puppeteer");
const path = require("path");

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
        await page.goto("file://" + path.resolve(html));

        try {
            const { overall, results } = await page.evaluate("runTests()");
            testResults.push({ file: suite.file, suite: suite.name, overall, results });
        } catch (err) {
            testResults.push({ file: suite.file, suite: suite.name, overall: { failed: 1 }, results: [{ failed: 1, assertions: [{ result: false, message: err }] }] });
        }
    }

    await browser.close();
    return testResults;
};

module.exports = runTests;