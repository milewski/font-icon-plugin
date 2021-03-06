import { loader } from "webpack";

export interface Configuration {
    loader: loader.LoaderContext
    options: {
        fontFamily: string
    }
}
