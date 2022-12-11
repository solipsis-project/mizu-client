import { BaseCommand, addInputParameters, getStorageOptions, getInputOptions, getBaseCommandOptions } from "../yargs.js";
import FLAGS from "./flags.js";
import { BaseCommandOptions, QueryOptions, QuerySyntax } from "./options.js";

export const command = 'query'
export const desc = 'run a json-rql query on the database'

function getQuerySyntax(argv) : QuerySyntax {
    if (argv[FLAGS.SPARQL]) {
        return QuerySyntax.Sparql;
    }
    if (argv[FLAGS.JSONRQL]) {
        return QuerySyntax.JsonRql;
    }
    return QuerySyntax.JsonRql;
}

export function apply(yargs: BaseCommand, callback: (options: QueryOptions) => any) {
    return yargs.command(command,
        desc,
        (yargs: BaseCommand) => {
            yargs = addInputParameters(yargs)
                .boolean(FLAGS.JSONRQL)
                .boolean(FLAGS.SPARQL)
                .conflicts(FLAGS.JSONRQL, FLAGS.SPARQL);
            return yargs;
        },
        async (argv) => {
            const baseOptions: BaseCommandOptions = getBaseCommandOptions(argv);
            const queryOptions: QueryOptions = {
                input: getInputOptions(argv),
                syntax: getQuerySyntax(argv),
                ...baseOptions
            }
            await callback(queryOptions);
        }
    );
}