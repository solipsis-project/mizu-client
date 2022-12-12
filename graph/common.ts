import { Algebra } from 'sparqljs';
import { Bindings, Graph, HashMapDataset, PipelineStage, PlanBuilder } from 'sparql-engine';
import { QueryOutput } from 'sparql-engine/dist/engine/plan-builder.js';
import _ from 'lodash';

export type IPLDValue = string | number | boolean | IPLD;

export type IPLDObject = IPLD | Array<IPLDValue>;

export interface IPLD {
    [x: string]: IPLDValue | Array<IPLDValue>;
}

export interface LinkedDataGraph extends Graph {
    count(pattern?: Triple): Promise<number>;
    forEach(consumer: (pattern: Triple) => void): Promise<void>;

    putIPLD(root: string, dag: IPLDObject): Promise<void>;
    getIPLD(root: string): Promise<IPLDObject>;

    load(dbPath: string): Promise<void>;
    save(dbPath: string): Promise<void>;
}

export function makeTriple(subject: string, predicate: string, object: string) {
    return { subject, predicate, object };
}

export const IRI = "https://mizu.stream/";

// TODO:
// -learn SPARQL
// -read documentation for sparql-engine
// -figure out what's going on with "start" and "end"

function unwrapTripleObject(obj: string): any {
    // Since all triple objects are stored as strings, we must unquote string literals and evaluate number literals.
    if (obj.length >= 2 && obj[0] == '"' && obj[obj.length-1] == '"') {
        return obj.substring(1, obj.length-1);
    }
    if (!isNaN(Number(obj))) {
        const objAsNumber = parseFloat(obj)
        if (!isNaN(objAsNumber)) {
            return objAsNumber;
        }
    }
    return obj;
}

function unwrapTripleObjectsInObj(obj: any): any {
    var result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (_.isString(value)) {
            result[key] = unwrapTripleObject(value);
        } else if (_.isArray(value)) {
            result[key] = value.map(unwrapTripleObjectsInObj);
        } else if (_.isObject(value)) {
            result[key] = unwrapTripleObjectsInObj(value);
        } else {
            result[key] = value;
        }
    }
    return result;
}

function getQueryIterator(query: string, dataset: HashMapDataset): PipelineStage<QueryOutput> {
    try {
        // Creates a plan builder for the RDF dataset
        const builder = new PlanBuilder(dataset)

        return builder.build(query) as PipelineStage<QueryOutput>;
    } catch(e) {
        throw `Error while running sparql-engine: ${e}`;
    }
}

export function resolveQuery(graph: LinkedDataGraph, query: string): Promise<Array<any>> {
    const baseQuery = `
    BASE <${IRI}>
    ${query}`

    const dataset = new HashMapDataset(IRI, graph)

    const iterator = getQueryIterator(baseQuery, dataset);

    // Read results
    return new Promise<Array<any>>((resolve, reject) => {
        var results = [];
        iterator.subscribe(
            bindings => {
                const bindingMap = (bindings as Bindings).toObject();
                results.push(unwrapTripleObjectsInObj(bindingMap));
            },
            err => reject(err),
            () => resolve(results)
        );
    })
}

export type Triple = Algebra.TripleObject;