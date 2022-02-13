// Convert the JSON DAG to a series of triples

import { CID, IPFSHTTPClient } from "ipfs-http-client";
import { IPLDObject, IPLDValue, Triple } from "./common";

async function* dagToTriplesInner(
        root_path : string,
        dag : IPLDObject,
        follow_links : IPFSHTTPClient | false,
        visited_subjects : Set<string>) : AsyncGenerator<Triple> {
    if (visited_subjects.has(root_path))  {
        return;
    }
    visited_subjects.add(root_path);
    for (const [key, value] of Object.entries(dag)) {
        if (value instanceof CID) {
            const child_path = value.toString();
            yield { subject : root_path, predicate : key, object : child_path }
            if (follow_links) {
                const child_value = await follow_links.dag.get(value).then((dag) => dag.value);
                yield* dagToTriplesInner(child_path, child_value, follow_links, visited_subjects);
            }
        }
        else if (value instanceof Object) {
            const child_path = `${root_path}/${key}`;
            yield { subject : root_path, predicate : key, object : child_path }
            yield* dagToTriplesInner(child_path, value, follow_links, visited_subjects);
        } else {
            yield { subject : root_path, predicate : key, object : value.toString() }
        }
    }
}

// TODO: Series of quads? CID is the graph name, path is the subject name?
export default async function* dagToTriples(
        root_path : string,
        dag : IPLDObject,
        follow_links : IPFSHTTPClient | false) : AsyncGenerator<Triple> {
    yield* dagToTriplesInner(root_path, dag, follow_links, new Set<string>());
}