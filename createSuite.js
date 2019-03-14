const path = require("path");
const fs = require("fs");
const hashCode = require("string-hash");
const prepareOptions = require("./prepare-options");
const buildHtml = require("./buildHtml");

const createSuite = (file, options) => {
    const suiteName = path.basename(file, path.extname(file));
    const { dependencies, htmlBody } = prepareOptions(options, suiteName);

    const htmlContent = buildHtml(dependencies[suiteName], file, htmlBody[suiteName]);

    const fileName = `${suiteName}-${hashCode(htmlContent)}`;
    fs.writeFileSync(fileName + ".html", htmlContent);

    return { file, html: path.resolve(fileName + ".html") };
};

module.exports = createSuite;