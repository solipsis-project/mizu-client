import { Graph } from 'sparql-engine';
import { N3Graph } from './n3/graph';
import { LevelRDFGraph } from './levelgraph/graph';
import { Flags, StorageType } from './flags';

export type GraphClass = (new(db: any) => Graph);

export interface Triple {
    subject : string,
    predicate : string,
    object : string
}

export function getStorage(storageType : StorageType) : GraphClass {
    switch (storageType) {
        case Flags.STORAGE_N3:
            return N3Graph;
        case Flags.STORAGE_LEVELGRAPH:
            return LevelRDFGraph;
    }
}