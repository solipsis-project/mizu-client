
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
import ReservedFields from '../reserved_fields.js'

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

beforeAll(async () => {
    await clearTempFiles(true);
});

afterAll(async () => {
    await clearTempFiles(false);
});

async function withTempDir(dbPath: string, callback) {
    const tempDir = fs.mkdtempSync(`${dbPath}/`);
    await callback(tempDir)
    fs.rmSync(tempDir, { recursive: true, force: true });
}
test('publish auto-signed message', async () => {
    const messageToPublish : IPLDObject = { string: "hello", integer: 3, boolean: true }

    await withTempDir(tempContainingDir, async (tempDir) => {
        const baseOptions = {
            minimumLogLevel: Logger.LogLevel.WARN,
            storageType: StorageType.Mock,
            databasePath: `${tempDir}/db`,
            ipfsOptions: { type: IPFSMode.Internal },
        } as const;
        await publishCommand({
            ...baseOptions,
            inputOption: { type: InputType.Ipld, value: messageToPublish },
            // TODO: Use environment variables to store the path and password.
            signingOption: { type: SigningType.Pem, keyFilePath: '/id_rsa', password: 'test' },
        })
        const ipld = await viewCommand({
            ...baseOptions,
            path: '/'
        });
        expect(ipld).toHaveProperty(ReservedFields.SIGNATURES)
        const signatures = ipld[ReservedFields.SIGNATURES];
        expect(signatures).toHaveProperty(ReservedFields.SIGNATURES_KEY);
        expect(signatures).toHaveProperty(ReservedFields.SIGNATURES_DIGEST);
    });
});