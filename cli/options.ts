import * as Logger from '../logger.js'

export enum IPFSMode { Http, Internal };
export type IPFSOptions =
    | { type: IPFSMode.Http, url: string }
    | { type: IPFSMode.Internal }
    
export enum InputType { File, Std, Cid };
export type InputOption =
    | { type: InputType.File, path: string }
    | { type: InputType.Std }
    | { type: InputType.Cid, cid: string }

export enum StorageType { N3, LevelGraph, Mock }

export type BaseCommandOptions = {
    minimumLogLevel: Logger.LogLevel,
    storageType: StorageType,
    databasePath: string,
    ipfsOptions: IPFSOptions,
}