const gulp = require("gulp");
const fs = require("fs");
const { initialise, logResults, compileXml } = require("../qunit-puppeteer-runner");

gulp.task("prepare", () => {
    return gulp.src("../node_modules/qunit/qunit/qunit.js")
        .pipe(gulp.dest("./node_modules/qunit/qunit"));
});

const run = initialise("./test/*.js", {
    globalDependencies: ["./test-namespaces.js"],
    // dependencies: { "tests3": ["./test-namespaces-2.js"] },
    htmlBody: {
        "tests3": "<span id='my-elem'></span>"
    },
    consolePassthrough: true,
    debug: false
});

for (const suite of run.suites) {
    gulp.task("run-" + suite, ["prepare"], async function () {
        const results = await run(suite);

        logResults(results);
        const xml = compileXml(results);

        fs.writeFileSync("TestResults.xml", xml);

        if (results.find(r => r.overall.failed > 0)) {
            throw new Error("Tests did not pass.");
        }
    });
}

gulp.task("run-all", ["prepare"], async function () {
    const results = await run();

    logResults(results);
    
    const xml = compileXml(results);

    fs.writeFileSync("TestResults.xml", xml);
    
    if (results.find(r => r.overall.failed > 0)) {
        throw new Error("Tests did not pass.");
    }
});
