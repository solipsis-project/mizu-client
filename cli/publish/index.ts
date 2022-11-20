import _ from "lodash";
import { BaseCommandOptions } from "../options.js";
import { BaseCommand, addInputParameters, getStorageOptions, getInputOptions, getBaseCommandOptions } from "../yargs.js";
import Flags from "./flags.js";
import { PublishOptions, SigningOption, SigningType } from "./options.js";

export const command = 'publish'
export const desc = 'publish a new message to this node'

function getSigningOptions(argv) : SigningOption {
    if (argv[Flags.SIGN_PGP]) {
        return { type: SigningType.Pgp, key: argv[Flags.SIGN_PGP] };
    }
    if (argv[Flags.SIGN_PEM]) {
        return { type: SigningType.Pem, keyFilePath: argv[Flags.SIGN_PEM].keyFilePath, password: argv[Flags.SIGN_PEM].password };
    }
    return { type: SigningType.None };
}

export function apply(yargs: BaseCommand, callback: (options: PublishOptions) => any) {
    return yargs.command(command,
        desc,
        (yargs: BaseCommand) => {
            yargs = addInputParameters(yargs);
            const result = yargs
                .boolean(Flags.IS_PUBLIC)
                .coerce(Flags.SIGN_PEM, (args) => {
                    if (!(_.isArray(args) && args.length > 2)) {
                        throw `${Flags.SIGN_PEM} requires exactly one or two parameters: the path to a PEM file and an optional password for encrypted files.`;
                    }
                    return {
                        keyFilePath: args[0],
                        password: (args.length == 2) ? args[1] : null
                    }
                });
            return result;
        },
        async (argv) => {
            const baseOptions: BaseCommandOptions = getBaseCommandOptions(argv);
            const publishOptions: PublishOptions = {
                inputOption: getInputOptions(argv),
                signingOption: getSigningOptions(argv),
                ...baseOptions
            }
            await callback(publishOptions);
        }
    );
}