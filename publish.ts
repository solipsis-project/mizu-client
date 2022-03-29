import { getStorage, GraphClass, Triple } from './graph'
import { create, IPFSHTTPClient, CID } from 'ipfs-http-client'
import { IPLDObject, IRI, LinkedDataGraph } from './graph/common';
import { getInput } from './input';
import { InputType, PublishOptions } from './cli/publish/options';
import normalizePath from './normalizePath';


export async function publishCommand(options: PublishOptions) {
    const input = options.input;
    const ipfs_client = await create({ url: options.ipfsOptions.url });
    const dag = await getInput(input, ipfs_client);
    const GraphClass = getStorage(options.storageType);
    const graph = new GraphClass(options.databasePath);
    const cid = (input.type == InputType.Cid) ? CID.parse(input.cid) : await ipfs_client.dag.put(dag);
    ipfs_client.pin.add(cid);
    console.log(`CID: ${cid.toString()}`);
    console.log(dag);
    if (!(dag instanceof Object)) {
        throw "Published data is a primitive, not linked data.";
    }
    await publish(graph, ipfs_client, cid, dag);
    graph.save(options.databasePath);
}



export async function publish(graph: LinkedDataGraph, ipfs_client: IPFSHTTPClient, cid: CID, dag: IPLDObject) {
    const root = `${IRI}${normalizePath(`${cid.toString()}/`)}`
    await graph.putIPLD(root, dag);
    console.log("Result");
    console.log(await graph.getIPLD(root));
}