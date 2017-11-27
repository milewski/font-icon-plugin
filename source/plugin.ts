import * as webpack from 'webpack'
import { loader } from 'webpack'
import { Communicator } from './communicator'
import { GeneratorPlugin } from './generator-plugin'
import { Compiler } from './Interfaces/Compiler'
import { PostcssPlugin } from './postcss-plugin'
import LoaderContext = webpack.loader.LoaderContext

export const PLUGIN_NAME = 'icon-font-webpack'

export class FontIconPlugin {

    constructor(private options) {}

    public apply(compiler: Compiler): void {

        const options: any = {
            publicPath: '/',
            fallbackType: 'eot',
            filename: 'font-icon.[ext]'
        }

        const communicator = new Communicator({ ...options, ...this.options })

        compiler.plugin('compilation', compilation => {

            compilation.plugin('normal-module-loader', (context: loader.LoaderContext, { loaders }) => {

                communicator.setLoader(context)

                loaders.forEach(entry => {

                    /**
                     * Apply PostcssPlugin to every loader that includes the postcss-loader
                     */
                    if (entry.loader.match(/postcss-loader/) && this.containPlugins(entry, context)) {
                        entry.options.plugins.push(
                            new PostcssPlugin(communicator).initialize(),
                            new GeneratorPlugin(communicator).initialize()
                        )
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
