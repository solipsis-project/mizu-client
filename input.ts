import { CID, IPFSHTTPClient } from 'ipfs-http-client';
import fs from 'fs';

import { Flags } from './flags';
import { IPLD } from './graph/common';

// Could I use classes here?
export class File { path : string };
export class StdIn { };
export class Cid { cid : string };
export type Input = File | StdIn | Cid;


export async function getInput(input : Input, ipfs_client : IPFSHTTPClient): Promise<IPLD> {
    if (input instanceof File) {
        return fs.promises.readFile(input.path).then((buffer) => JSON.parse(buffer.toString()));
    } else if (input instanceof StdIn) {
        const getStdin = (await import('get-stdin')).default;
        return getStdin().then((s) => JSON.parse(s));
    } else { // input instanceof Cid
        // TODO: determine whether the CID is a file or a dag. For now, assume dag.
        const cid = CID.parse(input.cid);
        // Support full ipfs address with CID and path.
        return ipfs_client.dag.get(cid).then((dag) => dag.value);
    }
}