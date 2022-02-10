import process from 'process'
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { Flags } from './flags';
import { getStorage } from './graph';
import { getInput, Input } from './input';
import { publish } from './publish';

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
        async function (argv) {
            const input = (() : Input => {
                if (argv[Flags.PUBLISH_FILE]) {
                    return { type : Flags.PUBLISH_FILE, path : argv[Flags.PUBLISH_FILE] };
                }
                if (argv[Flags.PUBLISH_STDIN]) {
                    return { type : Flags.PUBLISH_STDIN };
                }
                return { type : Flags.PUBLISH_CID, cid : argv[Flags.PUBLISH_CID] };
            })();
            publish(getStorage(argv.storage), await getInput(input, argv[Flags.IPFS_URL]));
        }
    )
    .strict().parse();
