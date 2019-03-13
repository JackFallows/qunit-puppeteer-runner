const gulp = require("gulp");
const fs = require("fs");
const { initialise, compileXml } = require("../qunit-puppeteer");

gulp.task("prepare", () => {
    return gulp.src("../node_modules/qunit/qunit/qunit.js")
        .pipe(gulp.dest("./node_modules/qunit/qunit"));
});

gulp.task("default", ["prepare"], async function () {
    const run = await initialise("./test/*.js", {
        globalDependencies: ["./test-namespaces.js"],
        dependencies: { "tests3": ["./test-namespaces-2.js"] },
        htmlBody: {
            "tests3": "<span id='my-elem'></span>"
        }
    });
    
    const results = await run();
    
    const xml = compileXml(results);
    
    fs.writeFileSync("TestResults.xml", xml);
});