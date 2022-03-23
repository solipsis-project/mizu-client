import { Graph } from 'sparql-engine';
import { N3Graph } from './n3';
import { LevelRDFGraph } from './levelgraph';
import { Flags, StorageType } from '../flags';
import { IPLD, LinkedDataGraph } from './common';
import { MockLinkedDataGraph } from './mocklinkeddatagraph';

export type GraphClass = (new(dbPath: string) => LinkedDataGraph);

export function getStorage(storageType : StorageType) : GraphClass {
    switch (storageType) {
        case Flags.STORAGE_N3:
            return N3Graph;
        case Flags.STORAGE_LEVELGRAPH:
            return LevelRDFGraph;
        case Flags.STORAGE_MOCK:
            return MockLinkedDataGraph;
    }
}

export { Triple, makeTriple } from './common';