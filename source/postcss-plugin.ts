import * as postcss from 'postcss';
import * as webfontsGenerator from 'webfonts-generator';
import * as path from "path";

const list = {}

module.exports = postcss[ 'plugin' ]('icon-font-webpack', loader => function (root, result) {

    return new Promise(accept => {

        root.walkRules(function (rule) {

            rule.walkDecls(function (declaration) {

                if (declaration.prop === 'content' && declaration.value.startsWith('url')) {

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
            files: Object.keys(list).map(key => 'demo/' + list[ key ].asset),
            writeFiles: false,
            dest: path.join(__dirname, '../demo/distribution/font')
        }, function (error, result) {

            const fontFace = postcss.rule({ selector: '@font-face' })
            fontFace.append(postcss.decl({ prop: 'font-family', value: "'font-icon'" }))
            fontFace.append(postcss.decl({ prop: 'src', value: "urla('fonts/icomoon.eot?kzyvua')" }))
            fontFace.append(postcss.decl({ prop: 'font-weight', value: "normal" }))
            fontFace.append(postcss.decl({ prop: 'font-style', value: "normal" }))

            const extension = postcss.rule({ selector: Object.keys(list).join(',') })
            extension.append(postcss.decl({ prop: 'font-family', value: "'font-icon'" }))
            extension.append(postcss.decl({ prop: 'speak', value: "none" }))
            extension.append(postcss.decl({ prop: 'font-style', value: "normal" }))
            extension.append(postcss.decl({ prop: 'font-weight', value: "normal" }))
            extension.append(postcss.decl({ prop: 'font-variant', value: "normal" }))
            extension.append(postcss.decl({ prop: 'text-transform', value: "none" }))
            extension.append(postcss.decl({ prop: 'line-height', value: "1" }))
            extension.append(postcss.decl({ prop: '-webkit-font-smoothing', value: "antialiased" }))
            extension.append(postcss.decl({ prop: '-moz-osx-font-smoothing', value: "grayscale" }))

            root.prepend(fontFace, extension)

            loader['emitFile']('icomoon.eot', result.woff2)

            for (let property in list) {

                const unicode = result.generateCss().match(
                    new RegExp(`${list[ property ].name}.*\n.*content:(.*);`)
                )[ 1 ]

                list[ property ].declaration.value = unicode.trim()

            }

            accept()

        })

    })

});
