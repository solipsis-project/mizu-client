
// Create a new keypair using ssh-keygen.
// Pass key in to publish
// View published message, verify it has signatures.
// Attempt to manually publish with incorrect signature. Make sure it gets rejected.

import fs from 'fs'

import { IPLDObject } from "../graph/common";
import { publishCommand } from "../publish.js"
import { viewCommand } from "../view.js"
import * as Logger from '../logger.js'
import { InputType, IPFSMode, SigningType, StorageType } from '../cli/publish/options';
import { ReservedFieldConstants } from '../reserved_fields.js'
import expect from 'expect';
import { assert } from 'console';
import { VerificationError } from '../errors';

const tempContainingDir = `./temp/`

async function clearTempFiles(createTestDir: boolean): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.rm(tempContainingDir, { recursive: true, force: true }, (err) => {
            if (err) {
                reject(err);
            } else {
                if (createTestDir) {
                    fs.mkdirSync(tempContainingDir);
                }
                resolve();
            }
        });
    });
}

before(async () => {
    await clearTempFiles(true);
});

after(async () => {
    await clearTempFiles(false);
});

async function withTempDir(dbPath: string, callback) {
    const tempDir = fs.mkdtempSync(`${dbPath}/`);
    await callback(tempDir)
    fs.rmSync(tempDir, { recursive: true, force: true });
}

it('publish auto-signed message', async () => {
    const messageToPublish : IPLDObject = { string: "hello", integer: 3, boolean: true }

    await withTempDir(tempContainingDir, async (tempDir) => {
        const baseOptions = {
            minimumLogLevel: Logger.LogLevel.WARN,
            storageType: StorageType.Mock,
            databasePath: `${tempDir}/db`,
            ipfsOptions: { type: IPFSMode.Internal },
        } as const;
        const cidString = await publishCommand({
            ...baseOptions,
            inputOption: { type: InputType.Ipld, value: messageToPublish },
            // TODO: Use environment variables to store the path and password.
            signingOption: { type: SigningType.Pem, keyFilePath: '/id_rsa', password: 'test' },
        })
        const ipld = await viewCommand({
            ...baseOptions,
            path: `https://mizu.stream/${cidString}`
        });

        expect(ipld).toHaveProperty(ReservedFieldConstants.SIGNATURES)
        const signatures = ipld[ReservedFieldConstants.SIGNATURES];
        expect(signatures).toHaveProperty(ReservedFieldConstants.SIGNATURES_KEY);
        expect(signatures).toHaveProperty(ReservedFieldConstants.SIGNATURES_DIGEST);
    });
});

it('reject incorrectly signed message', async () => {
    const messageToPublish : IPLDObject = {
        string: "hello",
        integer: 4,
        boolean: false,
        "$signatures": {
            key: "z7ySHQR7YZJApfZRKds9hzzFypZo8s6WQyZqXCYVHRjug84TSqhdKfQZEQ2x9JYdsAJHCCLE7tmGuqPjT8tiiaSZj8SLw8zzDss6VT6Rfh77dQPiZwVLqDVftPRGRSKqwbyrBve8hGLsVKjrMtEEN3SuAHS6jGxoEFHqc7Ybnm3jMdq3spUCAiLqMkhJ3WNhf7vbyhAJ8FbgyKoWRykp4TsUHiC3ADciNR7EBQrXnMSv4vS88hKAV26YFDUN18VdSdPivUFW2VMAFkLJSghyVofhjqRPQDngbXZoSTKy79Wkmg863VJHbX38o6JLTrjGC2hBPERuF62bGQ7USqgpJNJURowXVWt1QwMzM8MCMKyb5UwkS6AU6SWoRqmhXWUp1FqDZzVNjEqLewVe4cZV8AKCc",
            digest: "z8SM278tGAeoCsvgwzFpqXxRFQfJVtTNTgJuGGFd7QxaExY5BactSoA3Dh69DinSPM7Lsz2jCGHQKYBVp1CHagvL1YGGcLDNyNirA8uAPWaxyRFFp799rWHbtScLN7f1GYdaRDaBmwEFg7CqRBKvxYbE4AAPjD158uKZciyrk8T7PsCx5TF8FsUVQHD5ruCcBrRLEnfUYhjcCSbkrkDJc8eMUwuqFjc12FTv4HwAcuG1WFhtFWCKMF7WJkKbfPffK3BgUTutrgnWEq12mFhbbyU89iT9icVaTSPjkvSifAJPy2Dk6fTn2h34q3WNsst9Ggim8NQdXQDC9MpMdpmJc9EoJmNF7SP"
        }
    }

    await withTempDir(tempContainingDir, async (tempDir) => {
        const baseOptions = {
            minimumLogLevel: Logger.LogLevel.WARN,
            storageType: StorageType.Mock,
            databasePath: `${tempDir}/db`,
            ipfsOptions: { type: IPFSMode.Internal },
        } as const;
        return publishCommand({
                ...baseOptions,
                inputOption: { type: InputType.Ipld, value: messageToPublish },
                // TODO: Use environment variables to store the path and password.
                signingOption: { type: SigningType.None },
            }).then(
                (cid) => { expect(false).toBeTruthy() },
                (error : Error) => { expect(error).toBeInstanceOf(VerificationError);
                    expect(error.message).toBe("Unable to verify key");
                });

    });
});