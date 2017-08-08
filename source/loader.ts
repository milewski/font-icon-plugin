import * as favicons from 'favicons'
import * as fs from "fs";
import { getOptions, interpolateName } from 'loader-utils';
import * as toIco from 'to-ico';
import { loader } from "webpack";
import { js2xml, xml2js } from "xml-js";
import { Result } from "./Interfaces/CacheInterface";
import { Compilation } from "./Interfaces/Compilation";
import { FaviconsError, FaviconsResponse } from "./Interfaces/FaviconsResponse";
import { Icons, Manifest, PluginOptionsInterface } from "./Interfaces/PluginOptionsInterface";

export const raw = true;
export default function (content: Buffer) {

    const callback = this.async();
    const options = getOptions(this) as PluginOptionsInterface;

    options.configuration.path = interpolateName(this, addTrailingSlash(options.configuration.path), {
        context: this.options.context,
        content: content
    });

    /**
     * In development mode only generates a simple .ico
     */
    if (options.icons === 'dev') {

        return generateIcon(content)
            .then(image => {

                const iconPath = options.configuration.path + 'favicon.ico'
                const iconUrl = options.publicPath + options.configuration.path + 'favicon.ico'

                this.emitFile(iconPath, image, null)

                const result: Result = {
                    files: [],
                    images: [ iconPath ],
                    html: [
                        `<link rel="icon" href="${iconUrl}" type="image/x-icon"/>`
                    ],
                };

                callback(null, 'module.exports = ' + JSON.stringify(result))

            })
            .catch(error => callback(error));

    }

    /**
     * Generate icons
     */
    generateIcons(this, content, options)
        .then(result => callback(null, 'module.exports = ' + JSON.stringify(result)))
        .catch(error => callback(error))

};

export function getPublicPath(compilation: Compilation): string {
    return addTrailingSlash(
        compilation.outputOptions.publicPath || ''
    );
}

function addTrailingSlash(path: string): string {
    return path.endsWith('/') ? path : path.concat('/')
}

function generateIcon(image: Buffer): Promise<Result> {
    return toIco(image, { resize: true })
}

function generateIcons(loader: loader.LoaderContext, image: Buffer, options: PluginOptionsInterface): Promise<Result> {

    const config = { ...options.configuration, path: options.publicPath + options.configuration.path }

    return new Promise((resolve, reject) => {

        favicons(image, config, (error: FaviconsError, response: FaviconsResponse) => {

            if (error) return reject(error.message);

            /**
             * Remove Manifest, or Extend it accordingly
             */
            response = parseManifest(options.manifest, response)

            const result: Result = {
                ...response, images: response.images.map(item => item.name),
            };

            [].concat(response.images, response.files).forEach(item => {
                loader.emitFile(options.configuration.path + item.name, item.contents, null);
            });

            resolve(result);

        });

    })

}

function parseManifest<A extends FaviconsResponse>(manifest: Manifest, response: A): A {

    if (typeof manifest === 'boolean') {
        return response
    }

    // if (typeof manifest === 'boolean') {
    //
    //     if (manifest) return response
    //
    //     response.html = response.html.filter(item => !item.match(platform))
    //     response.files = response.files.filter(item => !item.name.match(platform))
    //
    //     return response
    //
    // }

    const platforms = {
        android: 'manifest.json',
        firefox: 'manifest.webapp',
        windows: 'browserconfig.xml',
        yandex: 'yandex-browser-manifest.json'
    }

    if (typeof manifest === 'object') {

        for (let key in manifest) {

            if (typeof manifest[ key ] === 'boolean') {
                continue
            }

            const file = response.files.find(
                (item => item.name === platforms[ key ])
            )

            if (file) {
                file.contents = extendManifest(key, manifest[ key ], file.contents)
            }

        }

        return response

    }

}

function extendManifest(platform: string, path: string, content: string): string {

    const manifestFile = fs.readFileSync(path).toString('utf8')

    if (platform === 'windows') {

        const options = { compact: true }
        const defaults = xml2js(manifestFile, options)
        const response = xml2js(content, options)

        return js2xml(
            extend(response, defaults), options
        )

    }

    return JSON.stringify(
        extend(JSON.parse(content), JSON.parse(manifestFile))
    )

}

function extend<A, B extends keyof A>(destination: A, source: B): A {

    for (let property in source) {

        if (typeof source[ property ] === "object") {

            if (Array.isArray(source[ property ])) {

                /**
                 * Here probably might need to check if destination
                 * is an array, only if there are nested array in array
                 * Which i think there will never be the case
                 */
                destination[ property ].push(...source[ property ])
                continue;
            }

            destination[ property ] = destination[ property ] || {};
            extend(destination[ property ], source[ property ]);

        } else {
            destination[ property ] = source[ property ];
        }

    }

    return destination;

}
