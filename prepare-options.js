function prepareOptions(options, suiteName) {
    if (options == null) {
        let dependencies = {};
        dependencies[suiteName] = [];
        return { dependencies, qunitConfig: { autostart: false }, htmlBody: {} };
    }
    
    if (Array.isArray(options)) {
        let dependencies = {};
        dependencies[suiteName] = options;
        return { dependencies, qunitConfig: { autostart: false }, htmlBody: {} };
    }

    let { globalDependencies, dependencies, htmlBody, consolePassthrough, debug, qunitConfig, qunitCallbacks } = options;
    
    if (dependencies == null) {
        let tempDep = {};
        tempDep[suiteName] = [];
        dependencies = tempDep;
    } else if (Array.isArray(dependencies)) {
        let tempDep = {};
        tempDep[suiteName] = dependencies;
        dependencies = tempDep;
    }
    
    if (Array.isArray(globalDependencies)) {
        if (dependencies[suiteName] == null) {
            dependencies[suiteName] = [];
        }
        
        dependencies[suiteName].unshift.apply(dependencies[suiteName], globalDependencies);
    }
    
    let html = {};
    if (typeof (htmlBody) === "string" || htmlBody == null) {
        html[suiteName] = htmlBody || "";
    } else {
        html = htmlBody || "";
    }
    
    qunitConfig = qunitConfig || {};
    qunitConfig.autostart = false;
    
    const acceptableCallbacks = [
        "begin",
        "done",
        "log",
        "moduleDone",
        "moduleStart",
        "on",
        "testDone",
        "testStart"
    ];
    
    const callbacks = {};
    for (const callback in qunitCallbacks) {
        if (qunitCallbacks.hasOwnProperty(callback) && acceptableCallbacks.includes(callback)) {
            callbacks[callback] = qunitCallbacks[callback];
        }
    }
    
    return { dependencies, htmlBody: html, consolePassthrough, debug, qunitConfig, qunitCallbacks: callbacks };
}

module.exports = prepareOptions;