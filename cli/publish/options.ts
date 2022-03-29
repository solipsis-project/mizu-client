import { BaseCommandOptions, InputOption } from "../options";

export type PublishOptions = BaseCommandOptions & {
    input: InputOption,
}

export * from "../options"