import * as path from 'path'
import { CacheInterface } from './Interfaces/CacheInterface'

export class Cache {

    public items: CacheInterface[] = []

    get selectors(): string[] {
        return this.items.map(item => item.selector)
    }

    get files(): string[] {
        return this.items
            .map(item => path.resolve(item.context, item.asset))
            .filter((element, index, items) => items.indexOf(element) === index)
    }

    public add(item: CacheInterface) {
        this.items.push(item)
    }

    public isEmpty(): boolean {
        return this.items.length === 0
    }

}
