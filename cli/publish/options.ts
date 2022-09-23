import { BaseCommandOptions, InputOption } from "../options.js";

export enum SigningType { None, Ssh, Pgp };
export type SigningOption =
    | { type: SigningType.None }
    | { type: SigningType.Ssh, key: string }
    | { type: SigningType.Pgp, key: string }

export type PublishOptions = BaseCommandOptions & {
    inputOption: InputOption,
    signingOption: SigningOption,
}

export * from "../options.js"