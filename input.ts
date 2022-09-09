import fs from 'fs';
import type {IPFS} from 'ipfs-core-types'
import { IPLDValue } from './graph/common.js';
import { InputOption, InputType } from './cli/options.js';
import { CID } from 'multiformats/cid'


export async function getInput(input: InputOption, ipfs_client: IPFS): Promise<IPLDValue> {
    switch (input.type) {
        case InputType.File:
            return fs.promises.readFile(input.path).then((buffer) => JSON.parse(buffer.toString()));
        case InputType.Std:
            const getStdin = (await import('get-stdin')).default;
            return getStdin().then((s) => JSON.parse(s));
        case InputType.Cid:
            // TODO: determine whether the CID is a file or a dag. For now, assume dag.
            const cid = CID.parse(input.cid);
            // Support full ipfs address with CID and path.
            return ipfs_client.dag.get(cid).then((dag) => dag.value);
    }
}