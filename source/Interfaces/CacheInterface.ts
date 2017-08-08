export type Result = {
    html: string[]
    images: string[]
    files: { name: string, contents: string }[]
}

export interface CacheInterface {
    hash: string
    optionHash: string
    version: number
    result: { html: string[] }
}
