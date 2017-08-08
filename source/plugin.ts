import { Compiler } from "./Interfaces/Compiler";

export class FontIconPlugin {

    constructor(private options) {
    }

    public apply(compiler: Compiler): void {

        compiler.plugin("compilation", (compilation) => {

            compilation.plugin('normal-module-loader', (loaderContext, module) => {

                module.loaders.map(loader => {
                    if (loader.loader.match(/postcss-loader/) && !loader.options.plugins) {
                        loader.options.plugins = [ require('./postcss-plugin')({
                            loader: loaderContext,
                            options: this.options
                        }) ]
                    }
                })

            });

        });

    };

}
