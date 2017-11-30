import { Declaration } from 'postcss'

export class Counter {

    private items: { [key: string]: Declaration } = {}
    private pointer: number = 0
    private cache = { length: null }

    get length(): number {
        return this.cache.length || ( this.cache.length = Object.keys(this.items).length )
    }

    public add(key: string, declaration: Declaration) {
        this.items[ key ] = declaration
    }

    public hasDeclarationForFile(file: string): boolean {
        return (++this.pointer) && this.items.hasOwnProperty(file)
    }

    public isLast(): boolean {
        return this.length ? this.length === this.pointer : false
    }

}
