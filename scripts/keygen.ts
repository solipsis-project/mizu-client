import * as crypto from '@libp2p/crypto'
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'
import esMain from 'es-main';
import * as Logger from '../logger.js';

export const COMMAND = 'keygen <password>';

export function builder(yargs) {
    return yargs.positional('password', {
        describe: 'Password to encrypt key with',
        type: 'string',
        default: ''
    });
}

export async function handler(argv) {
    const key = await crypto.keys.generateKeyPair('RSA');

    Logger.consoleLog(await key.export(argv.password));
}

if (esMain(import.meta)) {
    yargs(hideBin(process.argv)).command('$0 <password>', '', builder, handler).strict().parse();
}