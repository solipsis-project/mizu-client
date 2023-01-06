import { BaseCommand, addInputParameters, getStorageOptions, getInputOptions, getBaseCommandOptions } from "../yargs.js";
import Flags from "./flags.js";
import { BaseCommandOptions, ViewOptions } from "./options.js";

export const command = 'view-raw <path>'
export const desc = 'given a Mizu path, print the linked data at that path'

export function apply(yargs: BaseCommand, callback: (options: ViewOptions) => any) {
    return yargs.command(command,
        desc,
        (yargs: BaseCommand) => {
            return yargs.positional('path', { type: 'string' });
        },
        async (argv) => {
            const baseOptions: BaseCommandOptions = getBaseCommandOptions(argv);
            const queryOptions: ViewOptions = {
                path: argv.path,
                ...baseOptions
            }
            await callback(queryOptions);
        }
    );
}