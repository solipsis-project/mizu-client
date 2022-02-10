import { GraphClass, Triple } from './graph'
import { CID, IPFSHTTPClient } from 'ipfs-http-client'
import { Graph } from 'sparql-engine';

// Convert the JSON DAG to a series of triples
// TODO: Series of quads? CID is the graph name, path is the subject name?
async function* parseDagJson(
        root_path : string,
        dag : object,
        follow_links : boolean,
        visited_subjects : Set<string>,
        ipfs_client : IPFSHTTPClient) : AsyncGenerator<Triple> {
    if (visited_subjects.has(root_path))  {
        return;
    }
    visited_subjects.add(root_path);
    for (const [key, value] of Object.entries(dag)) {
        if (value instanceof CID) {
            const child_path = value.toString();
            yield { subject : root_path, predicate : key, object : child_path }
            if (follow_links) {
                const child_value = await ipfs_client.dag.get(value).then((dag) => dag.value);
                yield* parseDagJson(child_path, child_value, follow_links, visited_subjects, ipfs_client);
            }
        }
        else if (value instanceof Object) {
            const child_path = `${root_path}/${key}`;
            yield { subject : root_path, predicate : key, object : child_path }
            yield* parseDagJson(child_path, value, follow_links, visited_subjects, ipfs_client);
        } else {
            yield { subject : root_path, predicate : key, object : value }
        }
    }
}

export async function publish(graph : Graph, ipfs_client : IPFSHTTPClient, cid : CID, dag : unknown) {
    console.log(dag);
    if (!(dag instanceof Object)) {
        return;
    }
    for await (const triple of parseDagJson(cid.toString(), dag, true, new Set<string>(), ipfs_client)) {
        console.log(triple);
        graph.insert(triple);
    }
}