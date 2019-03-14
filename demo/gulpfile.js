const gulp = require("gulp");
const fs = require("fs");
const { initialise, compileXml } = require("../qunit-puppeteer");

gulp.task("prepare", () => {
    return gulp.src("../node_modules/qunit/qunit/qunit.js")
        .pipe(gulp.dest("./node_modules/qunit/qunit"));
});

(function start() {
    const run = initialise("./test/*.js", {
        globalDependencies: ["./test-namespaces.js"],
        dependencies: { "tests3": ["./test-namespaces-2.js"] },
        htmlBody: {
            "tests3": "<span id='my-elem'></span>"
        }
    });

    for (const suite of run.suites) {
        gulp.task("run-" + suite.name, ["prepare"], async function () {
            const results = await run(suite.name);
            
            const xml = compileXml(results);

            fs.writeFileSync("TestResults.xml", xml);
        });
    }

    gulp.task("run-all", ["prepare"], async function () {
        const results = await run();

        const xml = compileXml(results);

        fs.writeFileSync("TestResults.xml", xml);
    });
})();