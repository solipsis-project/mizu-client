import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { getInput, Input } from './input';

// Convert the JSON DAG to a series of triples
// TODO: Series of quads? CID is the graph name, path is the subject name?
function parseDagJson(dag : unknown, follow_links : boolean) {
    
}

import process from 'process'
import { Flags } from './flags';
import { publish } from './publish';
import { getStorage } from './graph';



const args = yargs(hideBin(process.argv))
    .option(Flags.STORAGE, {
        choices : [Flags.STORAGE_N3, Flags.STORAGE_LEVELGRAPH],
        demandOption : true
    })
    .option(Flags.IPFS_URL, {
            type : "string",
            default : "http://localhost:5001/api/v0"
        })
    .command(Flags.COMMAND_PUBLISH, 'publish a new message to this node',
        function (yargs) {
            return yargs.boolean('public')
            .string(Flags.PUBLISH_FILE)
            .boolean(Flags.PUBLISH_STDIN)
            .string(Flags.PUBLISH_CID)
            .conflicts(Flags.PUBLISH_FILE, [Flags.PUBLISH_STDIN, Flags.PUBLISH_CID])
            .conflicts(Flags.PUBLISH_STDIN, [Flags.PUBLISH_CID])
            .check((argv, aliases) => {
                if ((!argv[Flags.PUBLISH_FILE]) && (!argv[Flags.PUBLISH_STDIN]) && (!argv[Flags.PUBLISH_CID])) {
                    throw `Exactly one of --${Flags.PUBLISH_FILE}, ${Flags.PUBLISH_STDIN}, and --${Flags.PUBLISH_CID} must be provided.`;
                }
                return true;
            });
        },
        function (argv) {
            const input = (() : Input => {
                if (argv[Flags.PUBLISH_FILE]) {
                    return { type : Flags.PUBLISH_FILE, path : argv[Flags.PUBLISH_FILE] };
                }
                if (argv[Flags.PUBLISH_STDIN]) {
                    return { type : Flags.PUBLISH_STDIN };
                }
                return { type : Flags.PUBLISH_CID, cid : argv[Flags.PUBLISH_CID] };
            })();
            publish(getStorage(argv.storage), getInput(input, argv[Flags.IPFS_URL]));
        }
    )
    .strict().parse();
