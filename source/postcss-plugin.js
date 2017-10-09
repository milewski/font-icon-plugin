"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const postcss = require("postcss");
const webfontsGenerator = require("webfonts-generator");
const path = require("path");
const cache_1 = require("./cache");
const plugin_1 = require("./plugin");
class PostcssPlugin {
    constructor(options, loader) {
        this.loader = loader;
        this.options = { publicPath: '/', fallbackType: 'eot' };
        this.formats = {
            ttf: 'truetype',
            woff: 'woff',
            woff2: 'woff2',
            svg: 'svg',
            eot: 'embedded-opentype'
        };
        this.initialize = postcss.plugin(plugin_1.PLUGIN_NAME, () => root => this.process(this.root = root));
        this.options = Object.assign({}, this.options, options);
        this.cache = new cache_1.Cache(this.options.context);
    }
    process(root) {
        return new Promise((accept, reject) => {
            root.walkRules(rule => {
                rule.walkDecls(declaration => {
                    /**
                     * Detect the use of content: url('../my/asset.svg')
                     */
                    if (declaration.prop === 'content' && declaration.value.startsWith('url')) {
                        const [match, asset] = declaration.value.match(/url\(["'](.*)["']\)/);
                        const { name } = path.parse(asset);
                        const beforeRule = postcss.rule({ selector: rule.selector + ':before' });
                        const contentDeclaration = postcss.decl({ prop: 'content', value: "''" });
                        root.append(beforeRule.append(contentDeclaration));
                        declaration.remove();
                        this.cache.add({
                            asset: asset,
                            content: '',
                            declaration: contentDeclaration,
                            name: name,
                            selector: rule.selector
                        });
                    }
                });
            });
            /**
             * Generate Fonts
             */
            webfontsGenerator({
                files: this.cache.files,
                writeFiles: false,
                dest: __dirname
            }, (error, files) => {
                if (error) {
                    return reject(error);
                }
                const { outputDir } = this.options;
                const emittedFiles = [];
                for (let type in files) {
                    if (typeof files[type] !== 'function') {
                        const name = path.posix.join(outputDir, 'icon.' + type);
                        this.loader.emitFile(name, files[type], null);
                        emittedFiles.push({ name, type, format: this.formats[type] });
                    }
                }
                this.generateFontFaceDeclaration(emittedFiles);
                this.injectFontIconCharCode(files.generateCss());
                accept();
            });
        });
    }
    injectFontIconCharCode(generatedCSS) {
        this.cache.items.forEach(({ name, declaration }) => {
            const unicode = generatedCSS.match(new RegExp(`${name}.*\n.*content:(.*)`))[1];
            declaration.value = unicode.trim().replace(';', '');
        });
    }
    generateInlinedUrls(files) {
        return files.map((file, index) => {
            let url = path.posix.join(this.options.publicPath, file.name);
            /**
             * https://stackoverflow.com/questions/8050640/how-does-iefix-solve-web-fonts-loading-in-ie6-ie8
             */
            if (index === 0) {
                url += '?#iefix';
            }
            return `url('${url}') format('${file.format}')`;
        }).join(',\n' + ' '.repeat(7)); // space + indentation
    }
    generateFontFaceDeclaration(emittedFiles) {
        const { publicPath, familyName, fallbackType } = this.options;
        const fontFace = postcss.rule({ selector: '@font-face' });
        const fallbackFontUrl = path.posix.join(publicPath, emittedFiles.find(item => item.type === fallbackType).name);
        const inlinedFontUrls = this.generateInlinedUrls(emittedFiles);
        fontFace.append(postcss.decl({ prop: 'src', value: `url('${fallbackFontUrl}')` }));
        fontFace.append(postcss.decl({ prop: 'src', value: inlinedFontUrls }));
        fontFace.append(postcss.decl({ prop: 'font-family', value: `'${familyName}'` }));
        fontFace.append(postcss.decl({ prop: 'font-weight', value: 'normal' }));
        fontFace.append(postcss.decl({ prop: 'font-style', value: 'normal' }));
        const extension = postcss.rule({ selector: this.cache.selectors.join(',') });
        extension.append(postcss.decl({ prop: 'font-family', value: `'${familyName}'` }));
        extension.append(postcss.decl({ prop: 'speak', value: 'none' }));
        extension.append(postcss.decl({ prop: 'font-style', value: 'normal' }));
        extension.append(postcss.decl({ prop: 'vertical-align', value: 'middle' }));
        extension.append(postcss.decl({ prop: 'font-weight', value: 'normal' }));
        extension.append(postcss.decl({ prop: 'font-variant', value: 'normal' }));
        extension.append(postcss.decl({ prop: 'text-transform', value: 'none' }));
        extension.append(postcss.decl({ prop: 'line-height', value: '1' }));
        extension.append(postcss.decl({ prop: '-webkit-font-smoothing', value: 'antialiased' }));
        extension.append(postcss.decl({ prop: '-moz-osx-font-smoothing', value: 'grayscale' }));
        this.root.prepend(fontFace, extension);
    }
}
exports.PostcssPlugin = PostcssPlugin;
//# sourceMappingURL=postcss-plugin.js.map