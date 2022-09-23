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
    if (argv[Flags.SIGN_SSH]) {
        return { type: SigningType.Ssh, key: argv[Flags.SIGN_SSH] };
    }
    return { type: SigningType.None };
}

export function apply(yargs: BaseCommand, callback: (options: PublishOptions) => any) {
    return yargs.command(command,
        desc,
        (yargs: BaseCommand) => {
            yargs = addInputParameters(yargs);
            return yargs
                .boolean(Flags.IS_PUBLIC);
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