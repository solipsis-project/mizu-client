import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import Flags, { StorageChoices } from "./flags";

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

    constructor(public readonly yargs: BaseCommand) { }

    addCommand<Options>(command: Command<Options>, callback: (options: Options) => any) {
        return new YargsFluentInjector(command.apply(yargs, callback));
    }
}

export const baseYargsInjector = new YargsFluentInjector(baseCommand);