import { BaseCommandOptions, InputOption } from "../options.js";

export type ViewOptions = BaseCommandOptions & {
    path: string,
}

export * from "../options.js"