export type IPFSOptions = {
    url: string,
}

export enum InputType { File, Std, Cid };
export type InputOption =
    | { type: InputType.File, path: string }
    | { type: InputType.Std }
    | { type: InputType.Cid, cid: string }

export enum StorageType { N3, LevelGraph, Mock }

export type CommandOptions = {
    storageType: StorageType,
    databasePath: string,
    ipfsOptions: IPFSOptions,
}