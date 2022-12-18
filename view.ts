import { getStorage, GraphClass, Triple } from './graph/index.js'
import { CID } from 'multiformats';
import { IPLD, LinkedDataGraph, resolveQuery, SUBJECT_PREFIX } from './graph/common.js';
import { getInput } from './input.js';
import { InputType, PublishOptions } from './cli/publish/options.js';
import { QueryOptions } from './cli/query/options.js';
import { ViewOptions } from './cli/view/options.js';
import { ipfsUrl } from 'is-ipfs';
import { option } from 'yargs';


export async function viewCommand(options: ViewOptions) {
    // const ipfs_client = await create({ url: options.ipfsOptions.url });

    const GraphClass = getStorage(options.storageType);
    const graph = new GraphClass(options.databasePath);
    var path = options.path;
    if (!path.startsWith(SUBJECT_PREFIX)) {
        path = SUBJECT_PREFIX + path;
    }
    const ipld = await graph.getIPLD(path);
    console.log(ipld);
    return ipld;
    // This only gets records where this is a subject. If it's a value with no further keys, nothing gets returned.
    // Also what if there's multiple possible values in the datastore: this would return an array, right?
    // const cid = (options.input.type == InputType.Cid) ? CID.parse(options.input.cid) : await ipfs_client.dag.put(dag);
}