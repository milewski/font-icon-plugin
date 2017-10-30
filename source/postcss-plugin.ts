import * as path from 'path'
import * as postcss from 'postcss'
import { Root } from 'postcss'
import * as webfontsGenerator from 'webfonts-generator'
import { loader } from 'webpack'
import { Cache } from './cache'
import { PLUGIN_NAME } from './plugin'

export class PostcssPlugin {

    private root: Root
    private cache: Cache
    private options: any = { publicPath: '/', fallbackType: 'eot' }
    private formats = {
        ttf: 'truetype',
        woff: 'woff',
        woff2: 'woff2',
        svg: 'svg',
        eot: 'embedded-opentype'
    }

    public initialize = postcss.plugin(PLUGIN_NAME, () => root => this.process(this.root = root))

    constructor(options: any, private loader: loader.LoaderContext) {
        this.options = { ...this.options, ...options }
        this.cache = new Cache(this.options.context)
    }

    process(root: Root): Promise<void> {

        return new Promise<Cache>(accept => {

            root.walkRules(rule => {

                rule.walkDecls(declaration => {

                    /**
                     * Detect the use of content: url('../my/asset.svg')
                     */
                    if (declaration.prop === 'content' && declaration.value.startsWith('url')) {

                        const [ match, asset ] = declaration.value.match(/url\(["'](.*)["']\)/)
                        const { name } = path.parse(asset)

                        const beforeRule = postcss.rule({ selector: rule.selector + ':before' })
                        const contentDeclaration = postcss.decl({ prop: 'content', value: '\'\'' })

                        root.append(beforeRule.append(contentDeclaration))

                        declaration.remove()

                        this.cache.add({
                            asset: asset,
                            content: '',
                            declaration: contentDeclaration,
                            name: name,
                            selector: rule.selector
                        })

                    }

                })

            })

            accept(this.cache)

        }).then(cache => cache.isEmpty() ? null : this.generateWebFonts(cache.files))

    }

    private generateWebFonts(files: string[]): Promise<void> {

        return new Promise((accept, reject) => {

            webfontsGenerator({
                files: files,
                writeFiles: false,
                dest: __dirname
            }, (error, files: { [key: string]: string | Buffer | Function, generateCss: () => string }) => {

                if (error) { return reject(error) }

                const { outputDir } = this.options
                const emittedFiles = []

                for (let type in files) {

                    if (typeof files[ type ] !== 'function') {

                        const name = path.posix.join(outputDir, 'icon.' + type)

                        this.loader.emitFile(name, files[ type ] as Buffer, null)

                        emittedFiles.push({ name, type, format: this.formats[ type ] })

                    }

                }

                this.generateFontFaceDeclaration(emittedFiles)
                this.injectFontIconCharCode(files.generateCss())

                accept()

            })

        })
    }

    private injectFontIconCharCode(generatedCSS: string) {

        this.cache.items.forEach(({ name, declaration }) => {

            const unicode = generatedCSS.match(new RegExp(`${name}.*\n.*content:(.*)`))

            if (unicode && unicode[ 1 ])
                declaration.value = unicode[ 1 ].trim().replace(';', '')

        })

    }

    private generateInlinedUrls(files): string {

        return files.map((file, index) => {

            let url = path.posix.join(this.options.publicPath, file.name)

            /**
             * https://stackoverflow.com/questions/8050640/how-does-iefix-solve-web-fonts-loading-in-ie6-ie8
             */
            if (index === 0) { url += '?#iefix' }

            return `url('${url}') format('${file.format}')`

        }).join(',\n' + ' '.repeat(7)) // space + indentation
    }

    private generateFontFaceDeclaration(emittedFiles: { name: string, format: string, type: string }[]) {

        const { publicPath, familyName, fallbackType } = this.options

        const fontFace = postcss.rule({ selector: '@font-face' })
        const fallbackFontUrl = path.posix.join(publicPath, emittedFiles.find(item => item.type === fallbackType).name)
        const inlinedFontUrls = this.generateInlinedUrls(emittedFiles)

        fontFace.append(postcss.decl({ prop: 'src', value: `url('${fallbackFontUrl}')` }))
        fontFace.append(postcss.decl({ prop: 'src', value: inlinedFontUrls }))
        fontFace.append(postcss.decl({ prop: 'font-family', value: `'${familyName}'` }))
        fontFace.append(postcss.decl({ prop: 'font-weight', value: 'normal' }))
        fontFace.append(postcss.decl({ prop: 'font-style', value: 'normal' }))

        const extension = postcss.rule({ selector: this.cache.selectors.join(',') })

        extension.append(postcss.decl({ prop: 'font-family', value: `'${familyName}'` }))
        extension.append(postcss.decl({ prop: 'speak', value: 'none' }))
        extension.append(postcss.decl({ prop: 'font-style', value: 'normal' }))
        extension.append(postcss.decl({ prop: 'vertical-align', value: 'middle' }))
        extension.append(postcss.decl({ prop: 'font-weight', value: 'normal' }))
        extension.append(postcss.decl({ prop: 'font-variant', value: 'normal' }))
        extension.append(postcss.decl({ prop: 'text-transform', value: 'none' }))
        extension.append(postcss.decl({ prop: 'line-height', value: '1' }))
        extension.append(postcss.decl({ prop: '-webkit-font-smoothing', value: 'antialiased' }))
        extension.append(postcss.decl({ prop: '-moz-osx-font-smoothing', value: 'grayscale' }))

        this.root.prepend(fontFace, extension)

    }

}
