import { IPFSMode, IPFSOptions } from './cli/options.js'

import * as IpfsCore from 'ipfs-core'
import * as IpfsHttp from 'ipfs-http-client'
import type {IPFS as IpfsCoreType} from 'ipfs-core-types'

// TODO (https://github.com/solipsis-project/mizu-client/issues/21)
// There are some slight differences in the interface that prevent this from working.
export type IPFS = any;//IpfsCoreType | IpfsHttp.IPFSHTTPClient;

export default async function create(options: IPFSOptions): Promise<IPFS> {
    if (options.type == IPFSMode.Internal) {
        return IpfsCore.create();
    }
    return IpfsHttp.create({url: options.url});
}