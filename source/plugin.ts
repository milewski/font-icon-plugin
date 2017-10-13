import * as webpack from 'webpack'
import { Compiler } from './Interfaces/Compiler'
import { PostcssPlugin } from './postcss-plugin'
import LoaderContext = webpack.loader.LoaderContext

export const PLUGIN_NAME = 'icon-font-webpack'

export class FontIconPlugin {

    constructor(private options) {}

    public apply(compiler: Compiler): void {

        compiler.plugin('compilation', compilation => {

            compilation.plugin('normal-module-loader', (loaderContext, { context, loaders }) => {

                loaders.forEach(entry => {

                    /**
                     * Apply PostcssPlugin to every loader that includes the postcss-loader
                     */
                    if (entry.loader.match(/postcss-loader/) && this.containPlugins(entry, loaderContext)) {
                        entry.options.plugins.push(new PostcssPlugin({ context, ...this.options }, loaderContext).initialize())
                    }

                })

            })

        })

    }

    private containPlugins(entry: { options: { plugins: any[] } }, loader: LoaderContext): boolean {

        /**
         * If for some reason it happens to be a string, ignore it
         */
        if (typeof entry.options === 'string') {
            return false
        }

        if (typeof entry.options === 'undefined') {
            entry.options = { plugins: [] }
        }

        if (Array.isArray(entry.options.plugins)) {
            return !entry.options.plugins.some(plugin => plugin.postcssPlugin === PLUGIN_NAME)
        }

        if (typeof entry.options.plugins === 'function') {
            entry.options.plugins = [ ...entry.options.plugins(loader) ]
        } else {
            entry.options.plugins = []
        }

        return true

    }

}
