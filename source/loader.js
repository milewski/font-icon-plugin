"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const favicons = require("favicons");
const fs = require("fs");
const loader_utils_1 = require("loader-utils");
const toIco = require("to-ico");
const xml_js_1 = require("xml-js");
exports.raw = true;
function default_1(content) {
    const callback = this.async();
    const options = loader_utils_1.getOptions(this);
    options.configuration.path = loader_utils_1.interpolateName(this, addTrailingSlash(options.configuration.path), {
        context: this.options.context,
        content: content
    });
    /**
     * In development mode only generates a simple .ico
     */
    if (options.icons === 'dev') {
        return generateIcon(content)
            .then(image => {
            const iconPath = options.configuration.path + 'favicon.ico';
            const iconUrl = options.publicPath + options.configuration.path + 'favicon.ico';
            this.emitFile(iconPath, image, null);
            const result = {
                files: [],
                images: [iconPath],
                html: [
                    `<link rel="icon" href="${iconUrl}" type="image/x-icon"/>`
                ],
            };
            callback(null, 'module.exports = ' + JSON.stringify(result));
        })
            .catch(error => callback(error));
    }
    /**
     * Generate icons
     */
    generateIcons(this, content, options)
        .then(result => callback(null, 'module.exports = ' + JSON.stringify(result)))
        .catch(error => callback(error));
}
exports.default = default_1;
;
function getPublicPath(compilation) {
    return addTrailingSlash(compilation.outputOptions.publicPath || '');
}
exports.getPublicPath = getPublicPath;
function addTrailingSlash(path) {
    return path.endsWith('/') ? path : path.concat('/');
}
function generateIcon(image) {
    return toIco(image, { resize: true });
}
function generateIcons(loader, image, options) {
    const config = Object.assign({}, options.configuration, { path: options.publicPath + options.configuration.path });
    return new Promise((resolve, reject) => {
        favicons(image, config, (error, response) => {
            if (error)
                return reject(error.message);
            /**
             * Remove Manifest, or Extend it accordingly
             */
            response = parseManifest(options.manifest, response);
            const result = Object.assign({}, response, { images: response.images.map(item => item.name) });
            [].concat(response.images, response.files).forEach(item => {
                loader.emitFile(options.configuration.path + item.name, item.contents, null);
            });
            resolve(result);
        });
    });
}
function parseManifest(manifest, response) {
    if (typeof manifest === 'boolean') {
        return response;
    }
    // if (typeof manifest === 'boolean') {
    //
    //     if (manifest) return response
    //
    //     response.html = response.html.filter(item => !item.match(platform))
    //     response.files = response.files.filter(item => !item.name.match(platform))
    //
    //     return response
    //
    // }
    const platforms = {
        android: 'manifest.json',
        firefox: 'manifest.webapp',
        windows: 'browserconfig.xml',
        yandex: 'yandex-browser-manifest.json'
    };
    if (typeof manifest === 'object') {
        for (let key in manifest) {
            if (typeof manifest[key] === 'boolean') {
                continue;
            }
            const file = response.files.find((item => item.name === platforms[key]));
            if (file) {
                file.contents = extendManifest(key, manifest[key], file.contents);
            }
        }
        return response;
    }
}
function extendManifest(platform, path, content) {
    const manifestFile = fs.readFileSync(path).toString('utf8');
    if (platform === 'windows') {
        const options = { compact: true };
        const defaults = xml_js_1.xml2js(manifestFile, options);
        const response = xml_js_1.xml2js(content, options);
        return xml_js_1.js2xml(extend(response, defaults), options);
    }
    return JSON.stringify(extend(JSON.parse(content), JSON.parse(manifestFile)));
}
function extend(destination, source) {
    for (let property in source) {
        if (typeof source[property] === "object") {
            if (Array.isArray(source[property])) {
                /**
                 * Here probably might need to check if destination
                 * is an array, only if there are nested array in array
                 * Which i think there will never be the case
                 */
                destination[property].push(...source[property]);
                continue;
            }
            destination[property] = destination[property] || {};
            extend(destination[property], source[property]);
        }
        else {
            destination[property] = source[property];
        }
    }
    return destination;
}
//# sourceMappingURL=loader.js.map