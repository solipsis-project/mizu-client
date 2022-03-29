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
} as const;

export default Flags;

export const StorageChoices = [Flags.STORAGE_N3, Flags.STORAGE_LEVELGRAPH, Flags.STORAGE_MOCK];
export type StorageType = typeof StorageChoices[number];



