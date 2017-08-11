import * as postcss from 'postcss';
import * as webfontsGenerator from 'webfonts-generator';
import * as path from "path";
import { Configuration } from "./Interfaces/Configuration";

const list = {}

class PostcssPlugin {

    private name = 'icon-font-webpack'
    private root

    run() {
        return postcss.plugin(this.name, (configuration: Configuration) => {
            return root => this.process(this.root = root, configuration)
        })
    }

    process(root: postcss.Root, { loader, options }: Configuration): Promise<void> {
        return new Promise((accept, reject) => {

            root.walkRules(rule => {

                rule.walkDecls(declaration => {

                    /**
                     * Detect the use of content: url('../my/asset.svg')
                     */
                    if (declaration.prop === 'content' && declaration.value.startsWith('url')) {

                        // parseDeclaration(declaration)

                        const asset = declaration.value.match(/url\(["'](.*)["']\)/)[ 1 ]

                        const beforeRule = postcss.rule({ selector: rule.selector + ':before' })
                        const con = postcss.decl({ prop: 'content', value: '""' })

                        root.append(beforeRule.append(con));

                        declaration.remove()

                        list[ rule.selector ] = {
                            name: path.parse(asset).name,
                            asset: asset,
                            declaration: con,
                            content: ''
                        }

                    }

                });

            });

            webfontsGenerator({
                files: Object.keys(list).map(key => path.resolve(loader.context, list[ key ].asset)),
                writeFiles: false,
                dest: path.join(__dirname, '../demo/distribution/font')
            }, function (error, files) {

                const publicPath = '/'
                const outputPath = options.outputDir
                const outputedFiles = []

                const formats = {
                    ttf: 'truetype',
                    woff: 'woff',
                    svg: 'svg',
                    eot: 'embedded-opentype'
                }

                for (let type in files) {

                    if (typeof files[ type ] !== 'function') {

                        let name = path.posix.join(outputPath, 'icon.' + type);

                        loader.emitFile(name, files[ type ], null)

                        outputedFiles.push({
                            name: name,
                            type: type,
                            format: formats[ type ]
                        })

                    }

                }

                const fontFace = postcss.rule({ selector: '@font-face' })

                let inlineOutputFiles = outputedFiles.map(file => {
                    if (file.type === 'eot') { file.name += '#iefix' }
                    return `url('${publicPath + file.name}') format('${file.format}')`
                }).join(',\n')

                fontFace.append(postcss.decl(
                    { prop: 'src', value: `url('${publicPath}${outputedFiles[ 0 ].name}')` }
                ))

                fontFace.append(postcss.decl({ prop: 'src', value: inlineOutputFiles }))
                fontFace.append(postcss.decl({ prop: 'font-family', value: `'${options.familyName}'` }))
                fontFace.append(postcss.decl({ prop: 'font-weight', value: "normal" }))
                fontFace.append(postcss.decl({ prop: 'font-style', value: "normal" }))

                const extension = postcss.rule({ selector: Object.keys(list).join(',') })
                extension.append(postcss.decl({ prop: 'font-family', value: `'${options.familyName}'` }))
                extension.append(postcss.decl({ prop: 'speak', value: "none" }))
                extension.append(postcss.decl({ prop: 'font-style', value: "normal" }))
                extension.append(postcss.decl({ prop: 'vertical-align', value: "middle" }))
                extension.append(postcss.decl({ prop: 'font-weight', value: "normal" }))
                extension.append(postcss.decl({ prop: 'font-variant', value: "normal" }))
                extension.append(postcss.decl({ prop: 'text-transform', value: "none" }))
                extension.append(postcss.decl({ prop: 'line-height', value: "1" }))
                extension.append(postcss.decl({ prop: '-webkit-font-smoothing', value: "antialiased" }))
                extension.append(postcss.decl({ prop: '-moz-osx-font-smoothing', value: "grayscale" }))

                root.prepend(fontFace, extension)

                // loader.emitFile('ico/**/moon.eot', files.woff2, null)

                for (let property in list) {

                    const unicode = files.generateCss().match(
                        new RegExp(`${list[ property ].name}.*\n.*content:(.*);`)
                    )[ 1 ]

                    list[ property ].declaration.value = unicode.trim()

                }

                accept()

            })

        })
    }

}

module.exports = (new PostcssPlugin()).run()
