import { base32 } from 'multiformats/bases/base32'
import { base58btc } from 'multiformats/bases/base58'
// import varint from 'multiformats/varint.js'
import { IPLD } from './graph/common.js';
import * as crypto from '@libp2p/crypto'
import * as dagCborCodec from '@ipld/dag-cbor'

import varint from 'varint';
import * as Logger from './logger.js';

const LIBP2P_PUB = 0x72;

export function getSigner() : any {
    return null;
}

export async function verifySignature(dagWithoutSignatures: IPLD, encodedKey: string, encodedDigest: string) {
    // key is a multicodec containing a public key. By decoding it, we can determine the algorithm used.
    const keyBuffer = base58btc.decode(encodedKey);
    const keyType = varint.decode(keyBuffer);
    if (keyType != LIBP2P_PUB) {
        throw 'Signautre key must be a LibP2P public key multicodec.';
    }
    const key = crypto.keys.unmarshalPublicKey(keyBuffer);

    // Serialize the dag without signautres so that we can sign it.

    const dagCbor = dagCborCodec.encode(dagWithoutSignatures);

    const digestBuffer = base58btc.decode(encodedDigest);

    if (!(await key.verify(dagCbor, digestBuffer))) {
        throw "Unable to verify key";
    }
}