import { Compiler } from './Interfaces/Compiler'
import { PostcssPlugin } from './postcss-plugin'

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
                    if (entry.loader.match(/postcss-loader/) && this.containPlugins(entry)) {
                        entry.options.plugins.push(new PostcssPlugin({ context, ...this.options }, loaderContext).initialize())
                    }

                })

            })

        })

    }

    private containPlugins(entry: { options: { plugins: any[] } }): boolean {

        if (typeof entry.options === 'string') {
            return false
        }

        if (typeof entry.options === 'undefined') {
            entry.options = { plugins: [] }
        }

        if (entry.options.plugins) {
            return !entry.options.plugins.some(plugin => plugin.postcssPlugin === PLUGIN_NAME)
        }

        entry.options.plugins = []

        return true

    }

}
