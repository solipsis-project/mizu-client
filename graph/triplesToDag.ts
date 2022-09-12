import { Triple } from "./index.js";
import { IPLD, IPLDValue } from "./common.js";
import { inspect } from 'util';
import _ from 'lodash';

// An intermediate representation of parsed triple data. It needs to be cleaned up with parseIPLD to:
// - replace empty sets with their ids
// - replace single-element sets with their only element
type TripleRecord = { id : string, records : { [x : string] : TripleRecord[] } }

function parseIPLD(dag : TripleRecord) : IPLDValue {
    if (_.isEmpty(dag.records)) {
        return dag.id;
    }   
    const objectEntries = Object.entries(dag.records).map(([key , value]) => {
        // console.log(`Entry: ${key}, ${value}`);
        if (value.length == 1) {
            return [key, parseIPLD(value[0])];
        }
        return [key, value.map(parseIPLD)];
    });
    return Object.fromEntries(objectEntries);
}

export default function triplesToDag(
        root : string,
        triples : Triple[],
        follow_links : boolean) : IPLDValue {
    var hashTable : { [x : string] : TripleRecord } = {};
    for (const { subject, predicate, object } of triples) {
        if (!(subject in hashTable)) {
            hashTable[subject] = { id : subject, records : {} };
        }
        if (!(object in hashTable)) {
            hashTable[object] = { id : object, records : {} };
        }
        if (!(predicate in hashTable[subject])) {
            hashTable[subject].records[predicate] = [];
        }
        hashTable[subject].records[predicate].push(hashTable[object]);
    }
    if (root in hashTable) {
        return parseIPLD(hashTable[root]);
    }
    return {};
}