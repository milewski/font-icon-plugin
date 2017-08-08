export interface Compiler {
    context: any
    plugin(type: string, ...args): void
}
