const CleanPlugin = require("clean-webpack-plugin");
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const {FontIconPlugin} = require('../source/plugin');

module.exports = () => {

    return {
        context: __dirname,
        entry: {
            'app': './app.js',
            'sass': './sass.scss'
        },
        output: {
            path: __dirname + '/distribution',
            filename: '[name].js'
        },
        module: {
            rules: [

                {
                    test: /\.(svg|eot)$/,
                    loader: 'file-loader',
                    options: {
                        name: 'icons/[name].[ext]'
                    }
                },

                {
                    test: /\.scss$/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
                            { loader: 'css-loader', options: { sourceMap: true } },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    sourceMap: true,
                                    // plugins:[
                                    //     require('../source/postcss-plugin')
                                    // ]
                                }
                            },
                            { loader: 'resolve-url-loader' },
                            { loader: 'sass-loader', options: { sourceMap: true } }
                        ]
                    })
                }
            ]
        },
        plugins: [
            new CleanPlugin([ 'distribution' ], { root: __dirname }),
            new ExtractTextPlugin({
                filename: '[name].css?[contenthash]'
            }),
            new FontIconPlugin()
        ]
    }
}
