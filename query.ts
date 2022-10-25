import { getStorage, GraphClass, Triple } from './graph/index.js'
import { IPLD, LinkedDataGraph, resolveQuery } from './graph/common.js';
import { getInput, getStringInput } from './input.js';
import { InputType, PublishOptions } from './cli/publish/options.js';
import { QueryOptions } from './cli/query/options.js';
import { CID } from 'multiformats'
import createIpfs from './ipfs.js';
import getStdin from 'get-stdin';

export async function queryCommand(options: QueryOptions) {
    const ipfs_client = await createIpfs(options.ipfsOptions);
    try {
        const query = await getStringInput(options.input, ipfs_client);

        console.log(query);

        const GraphClass = getStorage(options.storageType);
        const graph = new GraphClass(options.databasePath);
        // const cid = (options.input.type == InputType.Cid) ? CID.parse(options.input.cid) : await ipfs_client.dag.put(dag);

        // TODO: Have mock persist between invocations.
        const results = await resolveQuery(graph, query);
        results.forEach((result) => {
            console.log(result);
        });
    } finally {
        ipfs_client.stop();
    }
}