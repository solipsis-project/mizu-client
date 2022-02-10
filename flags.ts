export const Flags = {
    STORAGE : 'storage',
    STORAGE_N3 : 'n3',
    STORAGE_LEVELGRAPH : 'levelgraph',

    IPFS_URL : 'ipfs',

    COMMAND_PUBLISH : 'publish',
    PUBLISH_FILE : 'file',
    PUBLISH_CID : 'cid',
    PUBLISH_STDIN : 'stdin'
} as const;

export type StorageType = typeof Flags.STORAGE_N3 | typeof Flags.STORAGE_LEVELGRAPH;





 