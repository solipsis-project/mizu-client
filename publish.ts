import { getStorage, GraphClass, Triple } from './graph'
import { create, IPFSHTTPClient, CID } from 'ipfs-http-client'
import { IPLD, LinkedDataGraph } from './graph/common';
import { getInput } from './input';
import { InputType, PublishOptions } from './cli/publish/options';


export async function publishCommand(options: PublishOptions) {
    const ipfs_client = await create({ url: options.ipfsOptions.url });
    const dag = await getInput(options.input, ipfs_client);
    const GraphClass = getStorage(options.storageType);
    const graph = new GraphClass(options.databasePath);
    const cid = (options.input.type == InputType.Cid) ? CID.parse(options.input.cid) : await ipfs_client.dag.put(dag);
    await publish(graph, ipfs_client, cid, dag);
    graph.save(options.databasePath);
}



export async function publish(graph: LinkedDataGraph, ipfs_client: IPFSHTTPClient, cid: CID, dag: IPLD) {
    ipfs_client.pin.add(cid);
    console.log(dag);
    if (!(dag instanceof Object)) {
        return;
    }
    await graph.putIPLD(cid, dag);
    console.log("Result");
    console.log(await graph.getIPLD(cid, ''));
}