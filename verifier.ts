// Some reserved field names enforce specific semantics.
// When a node receives a message from a peer or from the command line, it must verify that these semantics hold
// before adding the message to the database.

import _ from "lodash";
import { IPLD, IPLDObject, IPLDValue } from "./graph/common.js";
import ReservedFields from "./reserved_fields.js";
import { verifySignature } from "./signer.js";
import { CID } from 'multiformats';
import * as Logger from "./logger.js";

function getIterable(value: IPLDValue | Array<IPLDValue>): Iterable<IPLDValue> {
    if(_.isArray(value)) {
        return value;
    }
    return [value];
}

async function verifySignatures(dagContainingSignatures : IPLD) {
    const { [ReservedFields.SIGNATURES] : signatures, ...dagWithoutSignatures } = dagContainingSignatures;
    if (_.isUndefined(signatures)) {
        return;
    }
    for (const signature of getIterable(signatures)) {
        const key = signature[ReservedFields.SIGNATURES_KEY];
        if (_.isUndefined(key)) {
            throw `Missing ${ReservedFields.SIGNATURES_KEY} field.`;
        }
        if (!_.isString(key)) {
            throw `Expected string for ${ReservedFields.SIGNATURES_KEY} field, got ${key}.`;
        }
        
        const digest = signature[ReservedFields.SIGNATURES_DIGEST];
        if (_.isUndefined(digest)) {
            throw `Missing ${ReservedFields.SIGNATURES_DIGEST} field.`;
        }
        if (!_.isString(digest)) {
            throw `Expected string for ${ReservedFields.SIGNATURES_DIGEST} field, got ${key}.`;
        }
        await verifySignature(dagWithoutSignatures, key, digest);
    }
}

// If the message fails to verify, an exception is thrown containing a user-readable message.
export async function verify(dag: IPLDValue) : Promise<void> {
    if (!_.isObject(dag)) {
        return;
    }
    if (!_.isArray(dag)) {
        await verifySignatures(dag);
    }
    for (const [key, value] of Object.entries(dag)) {
        if (value instanceof CID) {
            throw "TODO: handle CID in verify";
        }
        else if (_.isArray(value)) {
            for (const element of value) {
                await verify(element);
            }
        }
        else if (value instanceof Object) {
            await verify(value);
        }
    }
    
}