const xmlescape = require("xml-escape");

const compileXml = function (testResults) {
    function writeFailure(testResult) {
        if (testResult.failed === 0) {
            return "";
        }

        return `\n\t\t\t<failure message="${xmlescape(testResult.assertions[0].message)}"/>\n\t\t`;
    }

    function compile(runResults) {
        return `<?xml version="1.0" encoding="UTF-8" ?>
<testsuites>
    ${runResults.map(({ file, overall, results }) =>
            `<testsuite name="${xmlescape(file)}" tests="${overall.total}" failures="${overall.failed}" errors="0" skipped="0" timestamp="${new Date().toGMTString()}" time="${overall.runtime}">
        ${results.map(r => `<testcase classname="${xmlescape(r.module)}" name="${xmlescape(r.name)}" time="${r.runtime}"${r.failed === 0 ? '/>' : '>'}${writeFailure(r)}${r.failed === 0 ? '' : '</testcase>'}`).join('\n\t\t')}
    </testsuite>`)}
</testsuites>
        `;
    }

    return compile(Array.isArray(testResults) ? testResults : [testResults]);
};

module.exports = compileXml;