import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import Flags, { StorageChoices } from "./flags";
import { BaseCommandOptions, InputOption, InputType, StorageType } from "./options";

const baseCommand = yargs(hideBin(process.argv))
    .option(Flags.STORAGE, {
        choices: StorageChoices,
        demandOption: true
    })
    .option(Flags.DATABASE_PATH, {
        type: "string",
        demandOption: true
    })
    .option(Flags.IPFS_URL, {
        type: "string",
        default: "http://localhost:5001/api/v0"
    });

export type BaseCommand = typeof baseCommand;

export interface Command<Options> {
    apply(yargs: BaseCommand, callback: (options: Options) => any): BaseCommand;
}

class YargsFluentInjector {

    constructor(public readonly yargsObject: BaseCommand) { }

    addCommand<Options>(command: Command<Options>, callback: (options: Options) => any) {
        return new YargsFluentInjector(command.apply(this.yargsObject, callback));
    }
}

export const baseYargsInjector = new YargsFluentInjector(baseCommand);

export function addInputParameters(yarg: BaseCommand) {
    return yarg.boolean(Flags.INPUT_STDIN)
        .string(Flags.INPUT_CID)
        .string(Flags.INPUT_FILE)
        .boolean(Flags.INPUT_STDIN)
        .conflicts(Flags.INPUT_FILE, [Flags.INPUT_STDIN, Flags.INPUT_CID])
        .conflicts(Flags.INPUT_STDIN, [Flags.INPUT_CID])
        .check((argv, aliases) => {
            if ((!argv[Flags.INPUT_FILE]) && (!argv[Flags.INPUT_STDIN]) && (!argv[Flags.INPUT_CID])) {
                throw `Exactly one of --${Flags.INPUT_FILE}, ${Flags.INPUT_STDIN}, and --${Flags.INPUT_CID} must be provided.`;
            }
            return true;
        });
}

export function getStorageOptions(argv): StorageType {
    if (argv[Flags.STORAGE_N3]) {
        return StorageType.N3;
    }
    if (argv[Flags.STORAGE_LEVELGRAPH]) {
        return StorageType.LevelGraph;
    }
    return StorageType.Mock;
};

export function getInputOptions(argv): InputOption {
    if (argv[Flags.INPUT_FILE]) {
        return { type: InputType.File, path: argv[Flags.INPUT_FILE] };
    };
    if (argv[Flags.INPUT_STDIN]) {
        return { type: InputType.Std };
    }
    return { type: InputType.Cid, cid: argv[Flags.INPUT_CID] };
};

export function getBaseCommandOptions(argv): BaseCommandOptions {
    return {
        storageType: getStorageOptions(argv),
        databasePath: argv[Flags.DATABASE_PATH],
        ipfsOptions: argv[Flags.IPFS_URL],
    }
}