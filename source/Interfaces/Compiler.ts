type Loader = {
    loader: string
    options?: { [key: string]: any }
}

type Rules = {
    test: RegExp,
    use: Loader[]
}

export interface Compiler {
    context: any
    plugin(type: string, ...args): void
    options: {
        module: {
            rules: Rules[]
        }
    }
}
