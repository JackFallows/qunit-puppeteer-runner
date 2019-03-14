function buildHtml(dependencies, testsSource, htmlBody) {
    return `
<html>
<head>
    <meta charset="utf-8">
</head>
<body>
    ${htmlBody || ""}

    <script src="node_modules/qunit/qunit/qunit.js"></script>

    <script>
        window.results = [];
    
        QUnit.config.autostart = false;
    </script>
    ${dependencies.map(d => `<script src="${d}"></script>`).join("\n\t")}
    ${`<script src="${testsSource}"></script>`}
    <script>
        function runTests() {
            return new Promise(resolve => {
                QUnit.testDone(function(testResult) {
                    window.results.push(testResult);
                });
                  
                QUnit.done(function (overall) {
                  resolve({ overall, results: window.results });
                });
                  
                QUnit.start();
            })
        }
    </script>
</body>
</html>
    `;
}

module.exports = buildHtml;