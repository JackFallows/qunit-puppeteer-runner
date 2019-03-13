const { assert, expect } = require("chai");
const prepareOptions = require("../prepare-options");

describe("prepareOptions", function () {
    describe("dependencies", function () {
        it("has suiteName property with empty array when options is null", function () {
            const { dependencies } = prepareOptions(null, "suiteName");
            expect(dependencies).to.have.property("suiteName").with.lengthOf(0);
            assert.ok(Array.isArray(dependencies["suiteName"]));
        });
        
        it("has suiteName property with options when options is an array", function () {
            const { dependencies } = prepareOptions(["my dependency"], "suiteName");
            expect(dependencies).to.have.property("suiteName").with.lengthOf(1);
            assert.ok(Array.isArray(dependencies["suiteName"]));
            assert.equal(dependencies["suiteName"][0], "my dependency");
        });
        
        it("has suiteName property with options when dependencies provided as an array property", function () {
            const { dependencies } = prepareOptions({ dependencies: ["my dependency"] }, "suiteName");
            expect(dependencies).to.have.property("suiteName").with.lengthOf(1);
            assert.ok(Array.isArray(dependencies["suiteName"]));
            assert.equal(dependencies["suiteName"][0], "my dependency");
        });
        
        it("is returned the same when dependencies is object on options", function () {
            const { dependencies } = prepareOptions({ dependencies: { "suiteName": ["my dependency"] } }, "suiteName");
            expect(dependencies).to.have.property("suiteName").with.lengthOf(1);
            assert.ok(Array.isArray(dependencies["suiteName"]));
            assert.equal(dependencies["suiteName"][0], "my dependency");
        });
    });
    
    describe("globalDependencies", function () {
        it("is included in dependencies", function () {
            const { dependencies } = prepareOptions({ dependencies: [], globalDependencies: ["my global dependency"] }, "suiteName");
            expect(dependencies).to.have.property("suiteName").with.lengthOf(1);
            assert.ok(Array.isArray(dependencies["suiteName"]));
            assert.equal(dependencies["suiteName"][0], "my global dependency");
        });
        
        it("is prepended to dependencies", function () {
            const { dependencies } = prepareOptions({ dependencies: ["my dependency"], globalDependencies: ["my global dependency"] }, "suiteName");
            expect(dependencies).to.have.property("suiteName").with.lengthOf(2);
            assert.ok(Array.isArray(dependencies["suiteName"]));
            assert.equal(dependencies["suiteName"][0], "my global dependency");
            assert.equal(dependencies["suiteName"][1], "my dependency");
        });
    });
    
    describe("transformFileName", function () {
        it("has a default if undefined", function () {
            const { transformFileName } = prepareOptions({ transformFileName: undefined });
            assert.equal(typeof (transformFileName), "function");
        });
        
        it("has a default that uses the suiteName", function () {
            const suiteName = "mySuite";
            const { transformFileName } = prepareOptions({ transformFileName: undefined }, suiteName);
            assert.equal(transformFileName(), `${suiteName}-results`);
        });
        
        it("can be overridden", function () {
            const { transformFileName } = prepareOptions({
                transformFileName: () => "overridden"
            });
            
            assert.equal(transformFileName(), "overridden");
        });
        
        it("correctly passes the suiteName to the function", function () {
            const { transformFileName } = prepareOptions({
                transformFileName: (sn) => `overridden-${sn}`
            });

            assert.equal(transformFileName("suiteName"), "overridden-suiteName");
        });
    });
    
    describe("htmlBody", function () {
        it("is an object with suiteName property that is an empty string if unprovided", function () {
            const { htmlBody } = prepareOptions({ htmlBody: undefined }, "suiteName");
            assert.exists(htmlBody);
            assert.equal(htmlBody["suiteName"], "");
        });
        
        it("is an object with suiteName property with provided string", function () {
            const { htmlBody } = prepareOptions({ htmlBody: "blah" }, "suiteName");
            assert.exists(htmlBody);
            assert.equal(htmlBody["suiteName"], "blah");
        });
        
        it("is returned the same if an object", function () {
            const { htmlBody } = prepareOptions({ htmlBody: { "suiteName": "blah" } }, "suiteName");
            assert.exists(htmlBody);
            assert.equal(htmlBody["suiteName"], "blah");
        });
    });
    
    describe("consolePassthrough", function () {
        it("has a default of false", function () {
            const { consolePassthrough } = prepareOptions({});
            assert.notOk(consolePassthrough);
        });
        
        it("can be set to true", function () {
            const { consolePassthrough } = prepareOptions({ consolePassthrough: true });
            assert.ok(consolePassthrough);
        });
    });
    
    describe("debug", function () {
        it("has a default of false", function () {
            const { debug } = prepareOptions({});
            assert.notOk(debug);
        });
        
        it("can be set to true", function () {
            const { debug } = prepareOptions({ debug: true });
            assert.ok(debug);
        });
        
        it("can be set to an object with delay property", function () {
            const { debug } = prepareOptions({ debug: { delay: 10 } });
            assert.equal(debug.delay, 10);
        });
    });
});