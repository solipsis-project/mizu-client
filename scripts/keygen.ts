import * as crypto from '@libp2p/crypto'
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'

yargs(hideBin(process.argv)).command(
    '$0 <password>',
    '',
    (yargs) => {
        return yargs.positional('password', {
            describe: 'Password to encrypt key with',
            type: 'string',
            default: ''
        });
    }, async (argv) => {
    const key = await crypto.keys.generateKeyPair('RSA');

    console.log(await key.export(argv.password));
}).strict().parse();