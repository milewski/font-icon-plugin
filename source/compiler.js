"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const SingleEntryPlugin = require("webpack/lib/SingleEntryPlugin.js");
const loader_1 = require("./loader");
class CompilerTemplate {
    constructor(options, context, compilation) {
        this.compilation = compilation;
        /**
         * The entry file is just an empty helper as the dynamic template
         * require is added in "loader.js"
         */
        this.output = {
            filename: (typeof options.export === 'string') ? options.export : 'icons-stats-[hash].json',
            publicPath: loader_1.getPublicPath(compilation)
        };
        /**
         * Create an additional child compiler which takes the template
         * and turns it into an Node.JS html factory.
         * This allows us to use loaders during the compilation
         */
        const compilerName = this.getCompilerName(context, options.source);
        /**
         * Create a Request Entry
         * this is like if you would to require some file in your .js file
         * in this case require('source.png')
         */
        const sourceImage = new SingleEntryPlugin(context, options.source);
        this.childCompiler = compilation.createChildCompiler(compilerName, this.output, [sourceImage]);
        this.childCompiler.context = context;
        this.childCompiler.options.module = {
            rules: {
                includes: options.source,
                loader: require.resolve('../source/loader.js'),
                options: Object.assign({ publicPath: this.output.publicPath }, options)
            }
        };
        /**
         * Fix for "Uncaught TypeError: __webpack_require__(...) is not a function"
         * Hot module replacement requires that every child compiler has its own cache
         * @see https://github.com/ampedandwired/html-webpack-plugin/pull/179
         */
        this.childCompiler.plugin('compilation', compilation => {
            if (compilation.cache) {
                if (!compilation.cache[compilerName]) {
                    compilation.cache[compilerName] = {};
                }
                compilation.cache = compilation.cache[compilerName];
            }
            compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
                if (!chunks.length) {
                    return callback(compilation.errors[0] || 'Favicons generation failed');
                }
                const resultFile = chunks[0].files[0];
                const resultCode = compilation.assets[resultFile].source();
                let resultJson;
                try {
                    resultJson = JSON.stringify(eval(resultCode));
                }
                catch (error) {
                    return callback(error);
                }
                compilation.assets[resultFile] = {
                    source: () => resultJson,
                    size: () => Buffer.byteLength(resultJson, 'utf8')
                };
                callback(null);
            });
        });
    }
    compile() {
        return new Promise((resolve, reject) => {
            this.childCompiler.runAsChild((error, entries, childCompilation) => {
                if (error)
                    return reject(error);
                /**
                 * Replace [hash] placeholders in filename
                 */
                const outputName = this.compilation.mainTemplate.applyPluginsWaterfall('asset-path', this.output.filename, {
                    hash: childCompilation.hash,
                    chunk: entries[0]
                });
                /**
                 * Resolve / reject the promise
                 */
                if (childCompilation && childCompilation.errors && childCompilation.errors.length) {
                    const errorDetails = childCompilation.errors.map(error => {
                        return error.message + (error.error ? ':\n' + error.error : '');
                    }).join('\n');
                    return reject(new Error('Child compilation failed:\n' + errorDetails));
                }
                resolve({
                    outputName: outputName,
                    stats: JSON.parse(childCompilation.assets[outputName].source())
                });
            });
        });
    }
    /**
     * Returns the child compiler name e.g. 'html-webpack-plugin for "index.html"'
     */
    getCompilerName(context, filename) {
        return `favicons-webpack-plugin for "${path.relative(context, filename)}"`;
    }
}
exports.CompilerTemplate = CompilerTemplate;
//# sourceMappingURL=compiler.js.map