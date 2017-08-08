import { Icons } from "./PluginOptionsInterface";

export interface OptionsInterface {
    // outputFilePrefix: string
    // regExp?: RegExp
    // persistentCache: boolean

    path: string
    appName: string
    appDescription: string
    developerName: string
    developerURL: string
    background: string
    theme_color: string
    display: string
    orientation: string
    start_url: string
    version: string
    logging: boolean
    online: boolean
    preferOnline: boolean
    lang: string

    icons: Partial<Icons>
}
