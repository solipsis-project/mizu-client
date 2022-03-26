import { Graph } from 'sparql-engine';
import { N3Graph } from './n3';
import { LevelRDFGraph } from './levelgraph';
import { IPLD, LinkedDataGraph } from './common';
import { MockLinkedDataGraph } from './mocklinkeddatagraph';
import Flags from '../cli/flags';
import { StorageType } from '../cli/options';

export type GraphClass = (new (dbPath: string) => LinkedDataGraph);

export function getStorage(storageType: StorageType): GraphClass {
    switch (storageType) {
        case StorageType.N3:
            return N3Graph;
        case StorageType.LevelGraph:
            return LevelRDFGraph;
        case StorageType.Mock:
            return MockLinkedDataGraph;
    }
}

export { Triple, makeTriple } from './common';