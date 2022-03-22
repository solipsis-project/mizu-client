import { Triple } from ".";
import { IPLD, IPLDValue } from "./common";

function collapseIds(dag : IPLD) : IPLD {
    return Object.fromEntries(Object.entries(dag).map(([key, value]) => {
        if (Object.keys(value) == ["@id"]) {
            return [key, value["@id"]];
        }
        return [key, value];
    }).flatMap(([key, value]) => {
        if (key == "@id") {
            return [];
        }
        return [[key, value]];
    }));
}

export default function triplesToDag(
        root : string,
        triples : Triple[],
        follow_links : boolean) : IPLD {
    var hashTable : { [x : string ] : { [x : string] : IPLDValue[] } } = {};
    for (const { subject, predicate, object } of triples) {
        if (!(subject in hashTable)) {
            hashTable[subject] = { "@id" : [subject] };
        }
        if (!(object in hashTable)) {
            hashTable[object] = { "@id" : [object] };
        }
        if (!(predicate in hashTable[subject])) {
            hashTable[subject][predicate] = [];
        }
        hashTable[subject][predicate].push(hashTable[object]);
    }
    console.log("RESULT");
    console.log(hashTable);
    console.log("ROOT");
    console.log(root);
    return hashTable[root];
}