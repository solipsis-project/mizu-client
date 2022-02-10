import { CID, IPFSHTTPClient } from 'ipfs-http-client';
import fs from 'fs';

import { Flags } from './flags';

type File = { type : typeof Flags.PUBLISH_FILE, path : string };
type StdIn = { type : typeof Flags.PUBLISH_STDIN };
type Cid = { type : typeof Flags.PUBLISH_CID, cid : string };
export type Input = File | StdIn | Cid;


export async function getInput(input : Input, ipfs_client : IPFSHTTPClient): Promise<unknown> {
    switch (input.type) {
        case Flags.PUBLISH_FILE:
            return fs.promises.readFile(input.path).then((buffer) => JSON.parse(buffer.toString()));
        case Flags.PUBLISH_STDIN:
            const getStdin = (await import('get-stdin')).default;
            return getStdin().then((s) => JSON.parse(s));
        case Flags.PUBLISH_CID:
            // TODO: determine whether the CID is a file or a dag. For now, assume dag.
            const cid = CID.parse(input.cid);
            // Support full ipfs address with CID and path.
            return ipfs_client.dag.get(cid).then((dag) => dag.value);
    }
}