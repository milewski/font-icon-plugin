import * as path from 'path'
import { Declaration, Root } from 'postcss'
import { CacheInterface } from './Interfaces/CacheInterface'

export class Cache {

    private entries: { [key: string]: CacheInterface[] } = {}
    private cache = { entries: null }
    private roots: { [key: string]: Root } = {}

    get items(): CacheInterface[] {

        if (this.cache.entries) {
            return this.cache.entries
        }

        const entries: CacheInterface[] = []

        for (let context in this.entries) {
            this.entries[ context ].forEach(entry => {
                entries.push(entry)
            })
        }

        return this.cache.entries = entries

    }

    get selectors(): string[] {

        const selectors: string[] = []

        for (let context in this.entries) {
            this.entries[ context ].forEach(item => {
                selectors.push(item.selector)
            })
        }

        return selectors

    }

    get declarations(): Declaration[] {

        const declarations: Declaration[] = []

        for (let context in this.entries) {
            this.entries[ context ].forEach(item => {
                declarations.push(item.declaration)
            })
        }

        return declarations

    }

    get files(): string[] {

        const files = []
        const cache = {}

        for (let context in this.entries) {

            const root = cache[ context ] || (cache[ context ] = path.parse(context).dir)

            this.entries[ context ].forEach(item => {
                files.push(path.resolve(root, item.asset))
            })

        }

        return files.filter((element, index, items) => items.indexOf(element) === index)

    }

    public add(root: Root, file: string, ...items: CacheInterface[]) {

        this.entries[ file ] = this.entries[ file ] || []
        this.roots[ file ] = root

        items.forEach(item => {
            this.entries[ file ].push(item)
        })

        //
        // if (this.entries[ key ] && this.entries[ key ].asset === item.name) {
        //     return Promise.resolve()
        // }
        //
        // new Promise(resolve => {
        //     this.entries[ key ] = item
        //     this.entries[ key ].resolver = resolve
        // })
        //
        // return Promise.resolve()

    }

    public isEmpty(): boolean {
        return Object.keys(this.entries).length === 0
    }

    public getRootFor(name: string): Root | null {

        for (let root in this.roots) {
            if (path.parse(root).name === name) {
                return this.roots[ root ]
            }
        }

        return null

    }

}
