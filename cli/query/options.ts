import { BaseCommandOptions, InputOption } from "../options";

export type QueryOptions = BaseCommandOptions & {
    input: InputOption,
}

export * from "../options"