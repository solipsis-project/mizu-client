import { Algebra } from 'sparqljs';
import { CID } from "ipfs-http-client";
import { Bindings, Graph, HashMapDataset, PipelineStage, PlanBuilder } from 'sparql-engine';
import { QueryOutput } from 'sparql-engine/dist/engine/plan-builder';

export type IPLDValue = string|number|boolean|IPLD|Array<IPLDValue>|CID;

export type IPLDObject = IPLD|Array<IPLDValue>;

export interface IPLD {
    [x: string]: IPLDValue;
}

export interface LinkedDataGraph extends Graph {
    count(pattern? : Triple) : Promise<number>;
    forEach(consumer : (pattern : Triple) => void) : Promise<void>;

    putIPLD(cid : CID, dag : IPLD) : Promise<void>;
    getIPLD(cid : CID, path : string) : Promise<IPLD>;

    load(dbPath : string) : Promise<void>;
    save(dbPath : string) : Promise<void>;
}

export function makeTriple(subject: string, predicate: string, object: string) {
    return {subject, predicate, object};
}

        // TODO:
        // -learn SPARQL
        // -read documentation for sparql-engine
        // -figure out what's going on with "start" and "end"

export function resolveQuery(graph : LinkedDataGraph, query : string) : Promise<Array<any>> {
    const IRI = 'http://example.org#graph-a'
       
    const dataset = new HashMapDataset(IRI, graph)
       
  // Creates a plan builder for the RDF dataset
  const builder = new PlanBuilder(dataset)

  // Get an iterator to evaluate the query
  const iterator = builder.build(query) as PipelineStage<QueryOutput>;

  // Read results
  return new Promise<Array<any>>((resolve, reject) => {
    var results = [];
    iterator.subscribe(
        bindings => {
            results.push((bindings as Bindings).toObject());
        },
        err => reject(err),
        () => resolve(results)
      );
  })
} 

export type Triple = Algebra.TripleObject;