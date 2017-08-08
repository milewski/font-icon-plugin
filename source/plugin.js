"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FontIconPlugin {
    constructor(options) {
        this.options = {};
    }
    apply(compiler) {
        compiler.plugin("compilation", function (compilation) {
            compilation.plugin('normal-module-loader', function (loaderContext, module) {
                module.loaders.map(loader => {
                    if (loader.loader.match(/postcss-loader/) && !loader.options.plugins) {
                        loader.options.plugins = [require('./postcss-plugin')(loaderContext)];
                    }
                });
            });
        });
    }
    ;
}
exports.FontIconPlugin = FontIconPlugin;
//# sourceMappingURL=plugin.js.map