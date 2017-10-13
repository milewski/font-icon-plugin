import { CacheInterface } from "./Interfaces/CacheInterface";
import * as path from "path";

export class Cache {

    public items: CacheInterface[] = []

    constructor(private context: string) {}

    get selectors(): string[] {
        return this.items.map(item => item.selector)
    }

    get files(): string[] {
        return this.items
            .map(item => path.resolve(this.context, item.asset))
            .filter((element, index, items) => items.indexOf(element) === index)
    }

    public add(item: CacheInterface) {
        this.items.push(item)
    }

    public isEmpty(): boolean {
        return this.items.length === 0
    }

}
