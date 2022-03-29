import { getStorage, GraphClass, Triple } from './graph'
import { create, IPFSHTTPClient, CID } from 'ipfs-http-client'
import { IPLD, LinkedDataGraph, resolveQuery } from './graph/common';
import { getInput } from './input';
import { InputType, PublishOptions } from './cli/publish/options';
import { QueryOptions } from './cli/query/options';


export async function queryCommand(options: QueryOptions) {
    const ipfs_client = await create({ url: options.ipfsOptions.url });
    const query = await getInput(options.input, ipfs_client);

    if (!(typeof query === "string")) {
        // We want to support json-rql queries, but right now, the query must be a sparql string.
        throw `Query must be a SPARQL string, was ${typeof query}`;
    }

    console.log(query);

    const GraphClass = getStorage(options.storageType);
    const graph = new GraphClass(options.databasePath);
    // const cid = (options.input.type == InputType.Cid) ? CID.parse(options.input.cid) : await ipfs_client.dag.put(dag);

    // TODO: Have mock persist between invocations.
    const results = await resolveQuery(graph, query);
    results.forEach((result) => {
        console.log(result);
    });
}