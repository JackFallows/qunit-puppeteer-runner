const { src, dest, series } = require("gulp");
const fs = require("fs");
const { initialise, logResults, compileXml } = require("../qunit-puppeteer-runner");

module.exports = {
    runAll: series(prepare, runAll)
}

const run = initialise("./test/*.js", {
    globalDependencies: ["./test-namespaces.js"],
    // dependencies: { "tests3": ["./test-namespaces-2.js"] },
    htmlBody: {
        "tests3": "<span id='my-elem'></span>"
    },
    consolePassthrough: true,
    debug: false,
    qunitCallbacks: {
        done: [function () {
            return new Promise(resolve => {
                setTimeout(() => {
                    console.log("Hello world!");
                    resolve();
                }, 2000);
            })
        }, function () { console.log("Hi!"); }]
    }
});

function prepare() {
    return src("../node_modules/qunit/qunit/qunit.js")
        .pipe(dest("./node_modules/qunit/qunit"));
}

for (const suite of run.suites) {
    async function test() {
        const results = await run(suite);

        logResults(results);
        const xml = compileXml(results);

        fs.writeFileSync("TestResults.xml", xml);

        if (results.find(r => r.overall.failed > 0)) {
            throw new Error("Tests did not pass.");
        }
    }

    module.exports[`run-${suite}`] = series(prepare, test);
}

async function runAll() {
    const results = await run();

    logResults(results);
    
    const xml = compileXml(results);

    fs.writeFileSync("TestResults.xml", xml);
    
    if (results.find(r => r.overall.failed > 0)) {
        throw new Error("Tests did not pass.");
    }
}
