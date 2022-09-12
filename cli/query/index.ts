import { BaseCommand, addInputParameters, getStorageOptions, getInputOptions, getBaseCommandOptions } from "../yargs.js";
import Flags from "./flags.js";
import { BaseCommandOptions, QueryOptions } from "./options.js";

export const command = 'query'
export const desc = 'run a json-rql query on the database'

export function apply(yargs: BaseCommand, callback: (options: QueryOptions) => any) {
    return yargs.command(command,
        desc,
        (yargs: BaseCommand) => {
            yargs = addInputParameters(yargs);
            return yargs;
        },
        async (argv) => {
            const baseOptions: BaseCommandOptions = getBaseCommandOptions(argv);
            const queryOptions: QueryOptions = {
                input: getInputOptions(argv),
                ...baseOptions
            }
            await callback(queryOptions);
        }
    );
}