import * as postcss from 'postcss'
import { Communicator } from './communicator'
import { PLUGIN_NAME } from './plugin'

export class GeneratorPlugin {

    constructor(private communicator: Communicator) {}

    public initialize = postcss.plugin(PLUGIN_NAME + '-compiler', () => () => {
        return this.communicator.generateFonts()
    })

}
