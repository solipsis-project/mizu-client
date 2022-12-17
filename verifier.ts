// Some reserved field names enforce specific semantics.
// When a node receives a message from a peer or from the command line, it must verify that these semantics hold
// before adding the message to the database.

import _ from "lodash";
import { IPLD, IPLDObject, IPLDValue } from "./graph/common.js";
import {ReservedFields, ReservedFieldConstants} from "./reserved_fields.js";
import { verifySignature } from "./signer.js";
import { CID } from 'multiformats';
import * as Logger from "./logger.js";
import { VerificationError } from "./errors.js";

function getIterable(value: IPLDValue | Array<IPLDValue>): Iterable<IPLDValue> {
    if(_.isArray(value)) {
        return value;
    }
    return [value];
}

async function verifySignatures(dagContainingSignatures : IPLD) {
    const { [ReservedFieldConstants.SIGNATURES] : signatures, ...dagWithoutSignatures } = dagContainingSignatures;
    if (_.isUndefined(signatures)) {
        return;
    }
    for (const signature of getIterable(signatures)) {
        const key = signature[ReservedFieldConstants.SIGNATURES_KEY];
        if (_.isUndefined(key)) {
            throw new VerificationError(`Missing ${ReservedFieldConstants.SIGNATURES_KEY} field.`);
        }
        if (!_.isString(key)) {
            throw new VerificationError(`Expected string for ${ReservedFieldConstants.SIGNATURES_KEY} field, got ${key}.`);
        }
        
        const digest = signature[ReservedFieldConstants.SIGNATURES_DIGEST];
        if (_.isUndefined(digest)) {
            throw new VerificationError(`Missing ${ReservedFieldConstants.SIGNATURES_DIGEST} field.`);
        }
        if (!_.isString(digest)) {
            throw new VerificationError(`Expected string for ${ReservedFieldConstants.SIGNATURES_DIGEST} field, got ${key}.`);
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
        if (key.startsWith("$") && !key.startsWith("$$") && !ReservedFields.includes(key)) {
            throw new VerificationError(`Unknown reserved field: ${key}`);
        }
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