import { IPLD } from '../graph/common.js'
import * as Logger from '../logger.js'

export enum IPFSMode { Http, Internal };
export type IPFSOptions =
    | { type: IPFSMode.Http, url: string }
    | { type: IPFSMode.Internal }
    
export enum InputType { File, Std, Cid, Ipld };
export type InputOption =
    | { type: InputType.File, path: string }
    | { type: InputType.Std }
    | { type: InputType.Cid, cid: string }
    | { type: InputType.Ipld, value: IPLD } // InputType.Ipld is not exposed to the CLI, but is useful when calling the API directly.

export enum StorageType { N3, LevelGraph, Mock }

export type BaseCommandOptions = {
    minimumLogLevel: Logger.LogLevel,
    storageType: StorageType,
    databasePath: string,
    ipfsOptions: IPFSOptions,
}