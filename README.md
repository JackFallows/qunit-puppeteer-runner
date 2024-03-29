# qunit-puppeteer-runner
Runs QUnit tests in a Puppeteer instance and compiles the results to JUnit XML.

# Requirements

This plugin uses `async`/`await`, so Node 7.6+ is required.

# Install

```
npm install --save-dev qunit-puppeteer-runner
```

# Usage

```
const gulp = require("gulp");
const fs = require("fs");
const { initialise, logResults, compileXml } = require("qunit-puppeteer-runner");

const run = initialise("./test/*.js", {
    globalDependencies: ["./test-namespaces.js"]
});

for (const suite of run.suites) {
    gulp.task("run-" + suite, async function () {
        const results = await run(suite);

        logResults(results);
        const xml = compileXml(results);

        fs.writeFileSync("TestResults.xml", xml);

        if (results.find(r => r.overall.failed > 0)) {
            throw new Error("Tests did not pass.");
        }
    });
}

gulp.task("run-all", async function () {
    const results = await run();

    logResults(results);
    
    const xml = compileXml(results);

    fs.writeFileSync("TestResults.xml", xml);
    
    if (results.find(r => r.overall.failed > 0)) {
        throw new Error("Tests did not pass.");
    }
});

```

The package exports 3 functions:

## initialise

```
initialise(sources: string[, options: object]): function([suiteName: string]): Array<object>
```

### sources
This is a Glob string to identify the JS test files.

### options
An optional object for setting the various supported options of the test runner. See below for details.

### Return value
Returns a function that can be called to execute the test run on one or all test suites.

The function also has a property on its prototype containing an array of the identified test suites called `suites`.

When called, the function will return an array of results objects.

## logResults

```
logResults(results: Array<object>)
```

This function can be called directly with the results of the `run` function returned by `initialise`. It will write the results of the test run out to the console.

## compileXml

```
compileXml(results: Array<object>): string
```

This function can be called directly with the results of the `run` function returned by `initialise`. It will return a string of JUnit XML which can be saved straight to a file.

# Options

## globalDependencies

**Type**: Array of JS file paths

Used to specify a set of JS file dependencies that are required by all selected test files.

## dependencies

**Type**: Array of JS file paths _or_ associative array of test suite names (test file name minus `.js` extension) and an array of JS file paths

When just an array of JS file paths, works the same as globalDependencies. When an associative array, allows dependencies to be set for each individual test suite.

### Setting dependencies for individual test suites

As mentioned above, you can use the `dependencies` setting on the global `options` object to set the dependencies for individual test suites.
However you can also set a `window.sources` array in your test file to name a set of dependencies in the test file itself.

e.g.
```
window.sources = [
    "./test-namespaces-2.js"
];

QUnit.module("namespaces");

...
```

## htmlBody

**Type**: string of HTML _or_ associative array of test suite names and a string of HTML

HTML content to render to the autogenerated HTML page's body.

### Setting HTML body for individual test suites

As mentioned above, you can use the `htmlBody` setting on the global `options` object to set the HTML body for individual test suites.
However you can also set a `window.html` string in your test file to write the string as HTML to the auto-generated HTML page. The HTML will be written before the tests are run and will be there for all tests in the suite.

**Note**: The HTML string is written once, before the tests are run. If a test alters the HTML it could affect the outcome of subsequent tests in the suite.

```
window.html = "<p>Some HTML</p>";

QUnit.module("namespaces");

...
```

## consolePassthrough

**Type**: boolean

Decides whether to passthrough console output from the test run to the Node console. Default: `false`

## debug

**Type**: boolean _or_ object with `delay` property

Decides whether to launch Puppeteer in non-headless mode, with DevTools open, enabling debugging with the `debugger;` statement. Default: `false`

Passing as an object with a `delay` property set to a number of milliseconds will instigate a delay before Puppeteer loads the page. This is to give the Chromium browser window time to open before starting the tests. If the test code executes before the window is visible, execution may not pause on any breakpoints. Default: `1000` milliseconds.

## qunitConfig

**Type**: object

Allows you to set any `QUnit.config` options. Note that `autostart` is always set to `false`. Some options may have no effect.

See https://api.qunitjs.com/config/QUnit.config 

## qunitCallbacks

**Type**: object

Allows you to set QUnit callbacks, which will be executed in the browser context, before any callbacks that are added by this tool.

The object can contain a single function for each callback, or an array of functions, e.g.

```
qunitCallbacks: {
    begin: [
        function () {
            // do something
        },
        function () {
            // do something else
        }
    ],
    done: function () {
        // do something
    }
}
```

See https://api.qunitjs.com/callbacks/

# CLI

The package includes a CLI tool to run tests via the command line called `qunit-run`. It can be used as follows:
```
qunit-run -source "./test/*.js"
```

It supports the following options:

* source *(required)*, e.g. `-source "./test/*.js"` - a glob string to identify the test suites
* settings, e.g. `-settings "./settings.js"` - a CommonJS module which exports an options object as described above
* output, e.g. `-output "results.xml"` - where to output the JUnit XML results
* debug, e.g. `--debug` - whether to run in debug mode (overrides the value in the `settings` module)
* consolePassthrough, e.g. `--consolePassthrough` - whether to pass through console output (overrides the value in the `settings` module)

**Note**: The use of `-` and `--` to prefix the options is meaningful. `-` represents an option which has an associated value (e.g. `-source`), whereas `--` represents a boolean switch, e.g. `--debug`.
