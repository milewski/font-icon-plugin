import { Compiler } from "./Interfaces/Compiler";

export class FontIconPlugin {

    public options = {}

    constructor(options) {

    }

    public apply(compiler: Compiler): void {

        compiler.plugin("compilation", function (compilation) {

            compilation.plugin('normal-module-loader', function (loaderContext, module) {

                module.loaders.map(loader => {
                    if (loader.loader.match(/postcss-loader/) && !loader.options.plugins) {
                        loader.options.plugins = [ require('./postcss-plugin')(loaderContext) ]
                    }
                })

            });

        });

    };

}
