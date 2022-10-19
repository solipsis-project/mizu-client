import { multibase } from './multibase.js'
// import varint from 'multiformats/varint.js'
import { IPLD } from './graph/common';
import * as crypto from '@libp2p/crypto'
import * as dagCborCodec from '@ipld/dag-cbor'
import type { PrivateKey, PublicKey } from '@libp2p/interface-keys'
import fs from 'fs';

import varint from 'varint';
import * as Logger from './logger';
import { SigningOption, SigningType } from './cli/publish/options.js';

const LIBP2P_PUB = 0x72;

interface Signer {
    marshallPublicKey() : Uint8Array;
    computeDigest(dagWithoutSignatures: IPLD) : Promise<Uint8Array>;
}

class PemSigner implements Signer {

    constructor(private readonly privateKey : PrivateKey) {}

    static async create(filepath : string, password : string) {
        const pemContents = await fs.promises.readFile(filepath);
        const privateKey = await crypto.keys.importKey(pemContents.toString(), password);
        return new PemSigner(privateKey);
    }

    marshallPublicKey(): Uint8Array {
        return crypto.keys.marshalPublicKey(this.privateKey.public);
    }

    async computeDigest(dagWithoutSignatures: IPLD): Promise<Uint8Array> {
        const dagCbor = dagCborCodec.encode(dagWithoutSignatures);
        return await this.privateKey.sign(dagCbor);
    }
    
}

export async function getSigner(signingOption : Exclude<SigningOption, { type: SigningType.None }>) : Promise<Signer> {
    switch (signingOption.type) {
        case SigningType.Pem:
            return await PemSigner.create(signingOption.keyFilePath, signingOption.password);
        case SigningType.Pgp:
            throw "PGP signing is not currently supported."
    }
}

export async function verifySignature(dagWithoutSignatures: IPLD, encodedKey: string, encodedDigest: string) {
    // key is a multicodec containing a public key. By decoding it, we can determine the algorithm used.
    const keyBuffer = multibase.decode(encodedKey);
    const keyType = varint.decode(keyBuffer);
    const key : PublicKey = crypto.keys.unmarshalPublicKey(keyBuffer);

    // Serialize the dag without signautres so that we can sign it.

    const dagCbor = dagCborCodec.encode(dagWithoutSignatures);

    const digestBuffer = multibase.decode(encodedDigest);

    if (!(await key.verify(dagCbor, digestBuffer))) {
        throw "Unable to verify key";
    }
}