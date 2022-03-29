import { BaseCommandOptions, InputOption } from "../options";

export type ViewOptions = BaseCommandOptions & {
    path: string,
}

export * from "../options"