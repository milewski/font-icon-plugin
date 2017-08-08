export interface Compilation {

    outputOptions: {
        publicPath: string
    }

    mainTemplate: any

    createChildCompiler(name: string, options: any, plugins?: any)

}
