const { assert, expect } = require("chai");
const fs = require("fs");
const { initialise } = require("../qunit-puppeteer");

describe("qunit-puppeteer", function () {
    describe("test-timeout", function () {
        it("will pass after 5 seconds", async function () {
            this.timeout(10000);
            // create a test file
            const content = `QUnit.module("Timeout");

QUnit.test("Pass after 10 seconds", function(assert) {
  const done = assert.async();
  setTimeout(function() { assert.ok(true); done(); }, 5000);
});`;

            fs.writeFileSync("test.js", content);

            // run qunit-puppeteer
            const run = initialise("test.js", {});
            const results = await run();

            assert.equal(results[0].overall.failed, 0, "QUnit test should have passed.");

            // delete test file
            fs.unlinkSync("test.js");
        });
        
        it("will fail if the test surpasses the set timeout", async function () {
            this.timeout(10000);
            // create a test file
            const content = `QUnit.module("Timeout");

QUnit.test("Pass after 10 seconds", function(assert) {
  const done = assert.async();
  setTimeout(function() { assert.ok(true); done(); }, 5000);
});`;
            
            fs.writeFileSync("test.js", content);
            
            // run qunit-puppeteer
            const run = initialise("test.js", { qunitConfig: { testTimeout: 2000 } });
            const results = await run();
            
            assert.isAtLeast(results[0].overall.failed, 1, "QUnit test should have failed.");
            
            // delete test file
            fs.unlinkSync("test.js");
        });
    });
});