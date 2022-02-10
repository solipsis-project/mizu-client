import { GraphClass, Triple } from './graph'
import { CID } from 'ipfs-http-client'

// Convert the JSON DAG to a series of triples
// TODO: Series of quads? CID is the graph name, path is the subject name?
function* parseDagJson(
        root_path : string,
        dag : object,
        follow_links : boolean,
        visited_subjects : Set<string>) : IterableIterator<Triple> {
    if (visited_subjects.has(root_path))  {
        return;
    }
    visited_subjects.add(root_path);
    // Handle special types for the value here. (For instance, it could be a CID.)
    for (const [key, value] of Object.entries(dag)) {
        if (value instanceof Object) {
            yield { subject : root_path, predicate : key, object : `${root_path}${key}/` }
            yield* parseDagJson(`${root_path}${key}/`, value, follow_links, visited_subjects);
        } else {
            yield { subject : root_path, predicate : key, object : value }
        }
    }
}

export async function publish(graphClass : GraphClass, dag : unknown) {
    console.log(dag);
    if (!(dag instanceof Object)) {
        return;
    }
    for (const triple of parseDagJson('/', dag, false, new Set<string>())) {
        console.log(triple);
    }
}