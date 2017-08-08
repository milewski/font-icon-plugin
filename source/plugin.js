"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FontIconPlugin {
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {
        compiler.plugin("compilation", (compilation) => {
            compilation.plugin('normal-module-loader', (loaderContext, module) => {
                module.loaders.map(loader => {
                    if (loader.loader.match(/postcss-loader/) && !loader.options.plugins) {
                        loader.options.plugins = [require('./postcss-plugin')({
                                loader: loaderContext,
                                options: this.options
                            })];
                    }
                });
            });
        });
    }
    ;
}
exports.FontIconPlugin = FontIconPlugin;
//# sourceMappingURL=plugin.js.map