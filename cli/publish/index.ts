import { BaseCommandOptions } from "../options.js";
import { BaseCommand, addInputParameters, getStorageOptions, getInputOptions, getBaseCommandOptions } from "../yargs.js";
import Flags from "./flags.js";
import { PublishOptions } from "./options.js";

export const command = 'publish'
export const desc = 'publish a new message to this node'

export function apply(yargs: BaseCommand, callback: (options: PublishOptions) => any) {
    return yargs.command(command,
        desc,
        (yargs: BaseCommand) => {
            yargs = addInputParameters(yargs);
            return yargs.boolean(Flags.IS_PUBLIC);
        },
        async (argv) => {
            const baseOptions: BaseCommandOptions = getBaseCommandOptions(argv);
            const publishOptions: PublishOptions = {
                input: getInputOptions(argv),
                ...baseOptions
            }
            await callback(publishOptions);
        }
    );
}