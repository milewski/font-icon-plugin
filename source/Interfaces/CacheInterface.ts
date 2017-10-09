import { Declaration } from "postcss";

export type Result = {
    html: string[]
    images: string[]
    files: { name: string, contents: string }[]
}

export interface CacheInterface {
    name: string
    asset: string
    declaration: Declaration
    content: string
    selector: string
}
