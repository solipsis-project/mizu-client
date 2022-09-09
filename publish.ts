import { getStorage, GraphClass, Triple } from './graph/index.js'
import { CID } from 'multiformats/cid'
import { IPLDObject, IRI, LinkedDataGraph } from './graph/common.js';
import { getInput } from './input.js';
import { InputType, PublishOptions } from './cli/publish/options.js';
import normalizePath from './normalizePath.js';
import * as Logger from './logger.js';
import { create } from './ipfs.js';
import type { IPFS } from 'ipfs-core-types'

export async function publishCommand(options: PublishOptions) {
    Logger.setMinimumLogLevel(options.minimumLogLevel);
    const input = options.input;
    const ipfs_client = await create(options.ipfsOptions);
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



export async function publish(graph: LinkedDataGraph, ipfs_client: IPFS, cid: CID, dag: IPLDObject) {
    const root = `${IRI}${normalizePath(`${cid.toString()}/`)}`
    await graph.putIPLD(root, dag);
}