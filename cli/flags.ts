const Flags = {
    STORAGE: 'storage',
    STORAGE_N3: 'n3',
    STORAGE_LEVELGRAPH: 'levelgraph',
    STORAGE_MOCK: 'mock',

    INPUT_FILE: 'file',
    INPUT_STDIN: 'stdin',
    INPUT_CID: 'cid',

    DATABASE_PATH: "db",

    IPFS_URL: 'ipfs',

    LOG_LEVEL: 'log',
    LOG_DEBUG: 'debug',
    LOG_VERBOSE: 'verbose',
    LOG_INFO: 'info',
    LOG_WARNING: 'warning',
    LOG_ERROR: 'error'
} as const;

export default Flags;

export const StorageChoices = [Flags.STORAGE_N3, Flags.STORAGE_LEVELGRAPH, Flags.STORAGE_MOCK];
export type StorageType = typeof StorageChoices[number];

export const LogLevelChoices = [Flags.LOG_DEBUG, Flags.LOG_VERBOSE, Flags.LOG_INFO, Flags.LOG_WARNING, Flags.LOG_ERROR];
export type LogLevelType = typeof LogLevelChoices[number];

