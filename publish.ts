import { GraphClass, Triple } from './graph'
import { CID, IPFSHTTPClient } from 'ipfs-http-client'
import { Graph } from 'sparql-engine';
import { IPLD, LinkedDataGraph } from './graph/common';



export async function publish(graph : LinkedDataGraph, ipfs_client : IPFSHTTPClient, cid : CID, dag : IPLD) {
    console.log(dag);
    if (!(dag instanceof Object)) {
        return;
    }
    await graph.putIPLD(cid, dag);
    console.log(await graph.getIPLD(cid, ''));
}