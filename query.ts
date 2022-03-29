import { getStorage, GraphClass, Triple } from './graph'
import { create, IPFSHTTPClient, CID } from 'ipfs-http-client'
import { IPLD, LinkedDataGraph } from './graph/common';
import { getInput } from './input';
import { InputType, PublishOptions } from './cli/publish/options';
import { QueryOptions } from './cli/query/options';

import jsonRQL from 'json-rql-sparql'


export async function queryCommand(options: QueryOptions) {
    const ipfs_client = await create({ url: options.ipfsOptions.url });
    const jsonRqlQuery = await getInput(options.input, ipfs_client);
    jsonRQL.toSparql(jsonRqlQuery, (err, sparql) => {
        console.log(err);
        console.log(sparql);
    });

    // const GraphClass = getStorage(options.storageType);
    // const graph = new GraphClass(options.databasePath);
    // const cid = (options.input.type == InputType.Cid) ? CID.parse(options.input.cid) : await ipfs_client.dag.put(dag);
    // await query(graph, ipfs_client, dag)
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