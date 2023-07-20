module.exports = {
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
};
