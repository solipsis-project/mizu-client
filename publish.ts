import { getStorage, GraphClass, Triple } from './graph'
import { create, IPFSHTTPClient, CID } from 'ipfs-http-client'
import { IPLDObject, IRI, LinkedDataGraph } from './graph/common';
import { getInput } from './input';
import { InputType, PublishOptions } from './cli/publish/options';
import normalizePath from './normalizePath';
import * as Logger from './logger';


export async function publishCommand(options: PublishOptions) {
    const input = options.input;
    const ipfs_client = await create({ url: options.ipfsOptions.url });
    const dag = await getInput(input, ipfs_client);
    const GraphClass = getStorage(options.storageType);
    const graph = new GraphClass(options.databasePath);
    const cid = (input.type == InputType.Cid) ? CID.parse(input.cid) : await ipfs_client.dag.put(dag);
    ipfs_client.pin.add(cid);
    Logger.debug((logger) => logger("message: ", dag));
    if (!(dag instanceof Object)) {
        throw "Published data is a primitive, not linked data.";
    }
    await publish(graph, ipfs_client, cid, dag);
    graph.save(options.databasePath);
    console.log(cid.toString());
}



export async function publish(graph: LinkedDataGraph, ipfs_client: IPFSHTTPClient, cid: CID, dag: IPLDObject) {
    const root = `${IRI}${normalizePath(`${cid.toString()}/`)}`
    await graph.putIPLD(root, dag);
}