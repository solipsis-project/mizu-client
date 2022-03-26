import { CommandOptions, InputOption } from "../options";

export type PublishOptions = CommandOptions & {
    input: InputOption,
}

export * from "../options"