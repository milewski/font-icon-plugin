"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const postcss_plugin_1 = require("./postcss-plugin");
exports.PLUGIN_NAME = 'icon-font-webpack';
class FontIconPlugin {
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {
        compiler.plugin('compilation', compilation => {
            compilation.plugin('normal-module-loader', (loaderContext, { context, loaders }) => {
                loaders.forEach(entry => {
                    /**
                     * Apply PostcssPlugin to every loader that includes the postcss-loader
                     */
                    if (entry.loader.match(/postcss-loader/) && this.containPlugins(entry)) {
                        entry.options.plugins.push(new postcss_plugin_1.PostcssPlugin(Object.assign({ context }, this.options), loaderContext).initialize());
                    }
                });
            });
        });
    }
    containPlugins(entry) {
        if (typeof entry.options === 'string') {
            return false;
        }
        if (typeof entry.options === 'undefined') {
            entry.options = { plugins: [] };
        }
        if (entry.options.plugins) {
            return !entry.options.plugins.some(plugin => plugin.postcssPlugin === exports.PLUGIN_NAME);
        }
        entry.options.plugins = [];
        return true;
    }
}
exports.FontIconPlugin = FontIconPlugin;
//# sourceMappingURL=plugin.js.map