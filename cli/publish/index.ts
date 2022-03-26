import ipfs from "ipfs-http-client";
import { BaseCommand } from "../yargs";
import Flags from "./flags";
import { InputOption, InputType, PublishOptions, StorageType } from "./options";

export const command = 'publish'
export const desc = 'publish a new message to this node'

export function apply(yargs: BaseCommand, callback: (options: PublishOptions) => any) {
    return yargs.command(command,
        desc,
        (yargs: BaseCommand) => {
            return yargs.boolean('public')
                .string(Flags.COMMAND_NAME)
                .boolean(Flags.PUBLISH_STDIN)
                .string(Flags.PUBLISH_CID)
                .conflicts(Flags.PUBLISH_FILE, [Flags.PUBLISH_STDIN, Flags.PUBLISH_CID])
                .conflicts(Flags.PUBLISH_STDIN, [Flags.PUBLISH_CID])
                .check((argv, aliases) => {
                    if ((!argv[Flags.PUBLISH_FILE]) && (!argv[Flags.PUBLISH_STDIN]) && (!argv[Flags.PUBLISH_CID])) {
                        throw `Exactly one of --${Flags.PUBLISH_FILE}, ${Flags.PUBLISH_STDIN}, and --${Flags.PUBLISH_CID} must be provided.`;
                    }
                    return true;
                })
        },
        async (argv) => {
            const input = ((): InputOption => {
                if (argv[Flags.PUBLISH_FILE]) {
                    return { type: InputType.File, path: argv[Flags.PUBLISH_FILE] };
                };
                if (argv[Flags.PUBLISH_STDIN]) {
                    return { type: InputType.Std };
                }
                return { type: InputType.Cid, cid: argv[Flags.PUBLISH_CID] };
            })();
            const storageType = ((): StorageType => {
                if (argv[Flags.STORAGE_N3]) {
                    return StorageType.N3;
                }
                if (argv[Flags.STORAGE_LEVELGRAPH]) {
                    return StorageType.LevelGraph;
                }
                return StorageType.Mock;
            })();
            const options: PublishOptions = {
                storageType: storageType,
                databasePath: argv[Flags.DATABASE_PATH],
                ipfsOptions: {
                    url: argv[Flags.IPFS_URL]
                },
                input: input,
            }
            await callback(options);
        }
    );
}