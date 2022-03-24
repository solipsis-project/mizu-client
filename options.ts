import { StorageType } from "./flags";
import { Input } from "./input";

export type IPFSOptions = {
    url : string,
}

export type CommandOptions = {
    storageType : StorageType,
    databasePath : string,
    ipfsOptions : IPFSOptions,
}

export type PublishOptions = CommandOptions & {
    input : Input,
}