import { BaseCommandOptions } from "../options";
import { BaseCommand, addInputParameters, getStorageOptions, getInputOptions, getBaseCommandOptions } from "../yargs";
import Flags from "./flags";
import { PublishOptions } from "./options";

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