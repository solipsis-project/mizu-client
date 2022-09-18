import { Graph } from 'sparql-engine';
import { N3Graph } from './n3.js';
import { LevelRDFGraph } from './levelgraph.js';
import { IPLD, LinkedDataGraph } from './common.js';
import { MockLinkedDataGraph } from './mocklinkeddatagraph.js';
import Flags from '../cli/flags.js';
import { StorageType } from '../cli/options.js';

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

export { Triple, makeTriple } from './common.js';