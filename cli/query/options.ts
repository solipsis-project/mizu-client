import { BaseCommandOptions, InputOption } from "../options.js";

export type QueryOptions = BaseCommandOptions & {
    input: InputOption,
}

export * from "../options.js"