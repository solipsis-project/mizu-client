import { BaseCommandOptions, InputOption } from "../options.js";

export enum QuerySyntax { Sparql, JsonRql};

export type QueryOptions = BaseCommandOptions & {
    input: InputOption,
    syntax: QuerySyntax
}

export * from "../options.js"