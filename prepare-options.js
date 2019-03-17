function prepareOptions(options, suiteName) {
    if (options == null) {
        let dependencies = {};
        dependencies[suiteName] = [];
        return { dependencies };
    }
    
    if (Array.isArray(options)) {
        let dependencies = {};
        dependencies[suiteName] = options;
        return { dependencies };
    }

    let { globalDependencies, dependencies, htmlBody, consolePassthrough, debug } = options;
    
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
    
    return { dependencies, htmlBody: html, consolePassthrough, debug };
}

module.exports = prepareOptions;