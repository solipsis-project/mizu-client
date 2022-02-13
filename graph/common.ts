import { Algebra } from 'sparqljs';
import { CID } from "ipfs-http-client";
import { Graph } from 'sparql-engine';

export type IPLDValue = string|number|boolean|IPLD|Array<IPLDValue>|CID;

export type IPLDObject = IPLD|Array<IPLDValue>;

export interface IPLD {
    [x: string]: IPLDValue;
}

export interface LinkedDataGraph extends Graph {
    load(dbPath : string) : Promise<void>;
    save(dbPath : string) : Promise<void>;
    putIPLD(cid : CID, dag : IPLD) : Promise<void>;
    getIPLD(cid : CID, path : string) : Promise<IPLD>;
}

export type Triple = Algebra.TripleObject;