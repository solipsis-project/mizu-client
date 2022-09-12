import { BaseCommandOptions, InputOption } from "../options.js";

export type PublishOptions = BaseCommandOptions & {
    input: InputOption,
}

export * from "../options.js"