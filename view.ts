import { getStorage, GraphClass, Triple } from './graph'
import { create, IPFSHTTPClient, CID } from 'ipfs-http-client'
import { IPLD, LinkedDataGraph, resolveQuery } from './graph/common';
import { getInput } from './input';
import { InputType, PublishOptions } from './cli/publish/options';
import { QueryOptions } from './cli/query/options';
import { ViewOptions } from './cli/view/options';


export async function viewCommand(options: ViewOptions) {
    // const ipfs_client = await create({ url: options.ipfsOptions.url });

    const GraphClass = getStorage(options.storageType);
    const graph = new GraphClass(options.databasePath);
    // const cid = (options.input.type == InputType.Cid) ? CID.parse(options.input.cid) : await ipfs_client.dag.put(dag);

    // TODO: Have mock persist between invocations.
}