import { BaseCommandOptions, InputOption } from "../options";

export type ViewOptions = BaseCommandOptions & {
    input: InputOption,
}

export * from "../options"