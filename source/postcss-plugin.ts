import * as path from 'path'
import * as postcss from 'postcss'
import { Result, Root } from 'postcss'
import { Communicator } from './communicator'
import { PLUGIN_NAME } from './plugin'

export class PostcssPlugin {

    constructor(private communicator: Communicator) {}

    public initialize = postcss.plugin(PLUGIN_NAME, () => (root, result) => {
        return this.communicator.intercept(
            this.process(root, result)
        )
    })

    process(root: Root, result: Result): Promise<void> {

        const parsed = path.parse(result.opts.from)

        this.communicator.setRoot(root, parsed.name)

        return new Promise(resolve => {

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

                        this.communicator.cache.add({
                            context: parsed.dir,
                            asset: asset,
                            content: '',
                            declaration: contentDeclaration,
                            name: name,
                            selector: rule.selector
                        })

                    }

                })

            })

            resolve()

        })

    }

}
