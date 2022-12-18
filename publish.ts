import { getStorage, GraphClass, Triple } from './graph/index.js'
import { CID } from 'multiformats'
import { IPLD, IPLDObject, SUBJECT_PREFIX, LinkedDataGraph } from './graph/common.js';
import { getInput } from './input.js';
import { InputType, PublishOptions, SigningType } from './cli/publish/options.js';
import normalizePath from './normalizePath.js';
import * as Logger from './logger.js';
import createIpfs from './ipfs.js';
import _ from 'lodash';
import { ReservedFieldConstants } from './reserved_fields.js';
import { getSigner } from './signer.js';
import { verify } from './verifier.js';
import { multibase } from './multibase.js';

export async function publishCommand(options: PublishOptions): Promise<string> {
    Logger.setMinimumLogLevel(options.minimumLogLevel);
    const { inputOption, signingOption } = options;
    if (inputOption.type == InputType.Cid && signingOption.type != SigningType.None) {
        throw "Message signing is not allowed when input type is CID";
    }
    const ipfs_client = await createIpfs(options.ipfsOptions);
    try {
        const dag = await getInput(inputOption, ipfs_client) as IPLD;
        // TODO: confirm dag is a graph
        await verify(dag);
        if (signingOption.type != SigningType.None) {
            const signer = await getSigner(signingOption);
            var signatures = dag[ReservedFieldConstants.SIGNATURES];
            delete dag[ReservedFieldConstants.SIGNATURES];
            if (_.isUndefined(signatures)) {
                signatures = [];
            }
            if (!_.isArray(signatures)) {
                throw "Message has invalid $signatures field.";
            }
            const multicodecKey = signer.marshallPublicKey();
            const digest = await signer.computeDigest(dag);
            signatures.push({
                [ReservedFieldConstants.SIGNATURES_KEY]: multibase.encode(multicodecKey),
                [ReservedFieldConstants.SIGNATURES_DIGEST]: multibase.encode(digest),
            })
            dag[ReservedFieldConstants.SIGNATURES] = signatures;
        }
        const GraphClass = getStorage(options.storageType);
        const graph = new GraphClass(options.databasePath);
        const cid = (inputOption.type == InputType.Cid) ? CID.parse(inputOption.cid) : await ipfs_client.dag.put(dag);
        ipfs_client.pin.add(cid);
        Logger.debug((logger) => logger("message: ", dag));
        if (!(dag instanceof Object)) {
            throw "Published data is a primitive, not linked data.";
        }
        await publish(graph, cid, dag);
        await graph.save(options.databasePath);
        Logger.consoleLog(cid.toString());

        return cid.toString();
    }
    finally {
        await ipfs_client.stop();
    }
}



export async function publish(graph: LinkedDataGraph, cid: CID, dag: IPLDObject) {
    const root = `${SUBJECT_PREFIX}${normalizePath(`${cid.toString()}/`)}`
    await graph.putIPLD(root, dag);
}