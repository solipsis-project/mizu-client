// Convert the JSON DAG to a series of triples

import _ from 'lodash';
import { CID } from 'multiformats';
import { IPLD, IPLDObject, IPLDValue, Triple } from "./common.js";

async function* yieldTriple(
    root_path: string,
    key: string,
    value: IPLDValue,
    index: number | null = null
) : AsyncGenerator<Triple> {
    if (value instanceof CID) {
        const child_path = value.toString();
        yield { subject: root_path, predicate: key, object: child_path }
    }
    else if (value instanceof Object) {
        const child_path = index != null ? `${root_path}/${key}/${index}` : `${root_path}/${key}`;
        yield { subject: root_path, predicate: key, object: child_path }
        yield* dagToTriples(child_path, value);
    } else {
        // The version of sparql-js we use stores literals as strings.
        // In order to distinguish between, eg. 2 and "2", quote the string literals.
        const object = _.isString(value) ? `"${value}"` : value.toString();
        yield { subject: root_path, predicate: key, object: object }
    }
}

// TODO: Series of quads? CID is the graph name, path is the subject name?
export default async function* dagToTriples(
    root_path: string,
    dag: IPLD
) : AsyncGenerator<Triple> {
    for (const [key, value] of Object.entries(dag)) {
        async function* inner(value: IPLDValue) {
            
        };
        // In our data model, an array represents a multi-valued field. The same subject and predicate pair is reused for each element in the array.
        if (_.isArray(value)) {
            var index = 0;
            for (const element of value) {
                yield* yieldTriple(root_path, key, element, index);
                index++;
            }
        } else {
            yield* yieldTriple(root_path, key, value);
        }
    }
}