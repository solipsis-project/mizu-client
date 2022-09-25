import { getStorage, GraphClass, Triple } from './graph/index.js'
import { CID } from 'multiformats/cid'
import { IPLDObject, IRI, LinkedDataGraph } from './graph/common.js';
import { getInput } from './input.js';
import { InputType, PublishOptions, SigningType } from './cli/publish/options.js';
import normalizePath from './normalizePath.js';
import * as Logger from './logger.js';
import createIpfs from './ipfs.js';
import _ from 'lodash';
import ReservedFields from './reserved_fields.js';
import { getSigner } from './signer.js';
import { verify } from './verifier.js';

export async function publishCommand(options: PublishOptions) {
    Logger.setMinimumLogLevel(options.minimumLogLevel);
    const { inputOption, signingOption } = options;
    if (inputOption.type == InputType.Cid && signingOption.type != SigningType.None) {
        throw "Message signing is not allowed when input type is CID";
    }
    const ipfs_client = await createIpfs(options.ipfsOptions);
    const dag = await getInput(inputOption, ipfs_client);
    verify(dag);
    if (signingOption.type != SigningType.None) {
        const signer = getSigner();
        var signatures = dag[ReservedFields.SIGNATURES];
        delete dag[ReservedFields.SIGNATURES];
        if (_.isUndefined(signatures)) {
            signatures = [];
        }
        if (!_.isArray(signatures)) {
            throw "Message has invalid $signatures field.";
        }
        const multicodecKey = signer.convertKeyToMulticodec(signingOption.key);
        const digest = signer.computeDigest(signingOption.key, dag);
        signatures.push({
            [ReservedFields.SIGNATURES_KEY]: multicodecKey,
            [ReservedFields.SIGNATURES_DIGEST]: digest
        })
        dag[ReservedFields.SIGNATURES] = signatures;
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
    graph.save(options.databasePath);
    Logger.consoleLog(cid.toString());
    ipfs_client.stop();
}



export async function publish(graph: LinkedDataGraph, cid: CID, dag: IPLDObject) {
    const root = `${IRI}${normalizePath(`${cid.toString()}/`)}`
    await graph.putIPLD(root, dag);
}