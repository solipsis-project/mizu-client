import { BaseCommandOptions, InputOption } from "../options.js";

export enum SigningType { None, Pem, Pgp };
export type SigningOption =
    | { type: SigningType.None }
    | { type: SigningType.Pem, keyFilePath: string, password: string | null }
    | { type: SigningType.Pgp, key: string }

export type PublishOptions = BaseCommandOptions & {
    inputOption: InputOption,
    signingOption: SigningOption,
}

export * from "../options.js"