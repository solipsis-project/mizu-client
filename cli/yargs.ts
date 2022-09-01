import yargs from "yargs";
import Flags, { LogLevelChoices, StorageChoices } from "./flags";
import { BaseCommandOptions, InputOption, InputType, StorageType } from "./options";
import YargsCommandConfig from "yargs-command-config";
import * as Logger from '../logger';

function baseCommand(yargs: YargsType) {
    return yargs
        .option(Flags.LOG_LEVEL, {
            choices: LogLevelChoices,
            default: Flags.LOG_INFO
        })
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
}

export type BaseCommand = ReturnType<typeof baseCommand>;

type YargsType = typeof yargs;

export interface Command<Options> {
    apply(yargs: BaseCommand, callback: (options: Options) => any): BaseCommand;
}

export class YargsFluentInjector {

    constructor(public readonly yargsObject: BaseCommand) { }

    addCommand<Options>(command: Command<Options>, callback: (options: Options) => any) {
        return new YargsFluentInjector(command.apply(this.yargsObject, callback));
    }
}

export function baseYargsInjector(configPath: string, config: any, callback: (yargs: YargsFluentInjector) => YargsFluentInjector) {
    return yargs.command(YargsCommandConfig({ file: configPath }))
        .command('$0', '', (yargs: YargsType) => {
            return callback(new YargsFluentInjector(baseCommand(yargs).config(config)))
        },
            async (argv) => { }
        );
}

export function addInputParameters(yarg: BaseCommand) {
    return yarg.boolean(Flags.INPUT_STDIN)
        .string(Flags.INPUT_CID)
        .string(Flags.INPUT_FILE)
        .boolean(Flags.INPUT_STDIN)
        .conflicts(Flags.INPUT_FILE, [Flags.INPUT_STDIN, Flags.INPUT_CID])
        .conflicts(Flags.INPUT_STDIN, [Flags.INPUT_CID]);
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
    if (argv[Flags.INPUT_CID]) {
        return { type: InputType.Cid, cid: argv[Flags.INPUT_CID] };
    }
    // If neither --cid or --file was provided, default to stdin.
    return { type: InputType.Std };

};

function getMinimumLogLevel(argv): Logger.LogLevel {
    switch (argv[Flags.LOG_LEVEL]) {
        case Flags.LOG_DEBUG: {
            return Logger.LogLevel.DEBUG;
        }
        case Flags.LOG_VERBOSE: {
            return Logger.LogLevel.VERBOSE;
        }
        case Flags.LOG_INFO: {
            return Logger.LogLevel.INFO;
        }
        case Flags.LOG_WARNING: {
            return Logger.LogLevel.WARN;
        }
    }
    return Logger.LogLevel.ERROR;
}

export function getBaseCommandOptions(argv): BaseCommandOptions {
    return {
        minimumLogLevel: getMinimumLogLevel(argv),
        storageType: getStorageOptions(argv),
        databasePath: argv[Flags.DATABASE_PATH],
        ipfsOptions: argv[Flags.IPFS_URL],
    }
}