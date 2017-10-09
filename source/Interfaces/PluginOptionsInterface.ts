import { OptionsInterface } from "./OptionsInterface";

type PlatformOptions = {
    offset: number
    shadow: string
    background: boolean | string
}

type background = boolean | string

export type Icons = {
    favicons: boolean
    android: boolean | Partial<{ offset: number, shadow: string, background: background }>,
    appleIcon: boolean | Partial<{ background: background, offset: number }>
    appleStartup: boolean | Partial<{ background: background, offset: number }>
    coast: boolean | Partial<{ background: background, offset: number }>
    firefox: boolean | Partial<{ background: background, offset: number }>
    windows: boolean | Partial<{ background: background }>
    yandex: boolean | Partial<{ background: background }>
}

export type IconsType = 'default' | 'dev' | 'full' | Partial<Icons>
export type Platforms = {
    android: string | boolean,
    firefox: boolean | string,
    windows: boolean | string,
    yandex: boolean | string
}
export type Manifest = boolean | string | Partial<Platforms>

export interface PluginOptionsInterface {


    source: string
    path?: string
    export?: string | boolean
    inject?: boolean
    publicPath?: string
    copyFaviconToRoot?: boolean
    manifest?: Manifest

    icons?: IconsType

    configuration?: Partial<OptionsInterface>

// icons?: 'dev' | 'default' | 'full' | Object, //(maybe there is a definition for https://www.npmjs.com/package/favicons options.icons)
    // manifest?: 'string' | true | false, // string would be a path to the manifest file relative to the webpack compiler context - default: true
    // inject?: boolean, // wether it should try to add it to html-webplugin - default true
    // export?: string, // where the information about the assets should be exported to
    // faviconsOptions?: Object  // https://www.npmjs.com/package/favicons options except icons
}
