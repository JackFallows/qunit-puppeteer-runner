function buildHtml(dependencies, testsSource, htmlBody, pathToQunit, qunitConfig) {
    return `
<html>
<head>
    <meta charset="utf-8">
</head>
<body>
    ${htmlBody || ""}


    <script>
        window.results = [];
    
        window.QUnit = {
            config: ${JSON.stringify(qunitConfig)}
        };
    </script>

    <script src="${pathToQunit}"></script>

    ${dependencies.map(d => `<script src="${d}"></script>`).join("\n\t")}
    ${`<script src="${testsSource}"></script>`}
    <div id="sources"></div>
    <script>
        if (window.html) {
            document.getElementsByTagName("body")[0].insertAdjacentHTML("afterbegin", window.html);
        }
    
        function runTests() {
            return new Promise((resolve, reject) => {
                loadSources().then(() => {
                    QUnit.testDone(function(testResult) {
                        window.results.push(testResult);
                    });
                      
                    QUnit.done(function (overall) {
                        resolve({ overall, results: window.results });
                    });
                      
                    QUnit.start();
                }).catch(reject);
            });
        }
        
        function loadSources() {
            if (Array.isArray(window.sources)) {
                const promises = [];
                for (const source of window.sources) {
                    promises.push(new Promise((resolve, reject) => {
                        const script = document.createElement("script");
                        script.onload = function (e) {
                            resolve();
                        };
                        script.onerror = function () {
                            reject("Could not load " + this.src);
                        }
                        
                        script.src = source;
                        
                        document.getElementById("sources").appendChild(script);
                    }));
                }
                
                return Promise.all(promises);
            }
            
            return Promise.resolve();
        }
    </script>
</body>
</html>
    `;
}

module.exports = buildHtml;