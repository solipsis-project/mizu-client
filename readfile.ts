import jschardet from 'jschardet';
import fs from 'fs';

export default async function readFile(filePath: string) : Promise<string> {
    const buffer = await fs.promises.readFile(filePath);
    const { encoding } = jschardet.detect(buffer);
    return buffer.toString(encoding as BufferEncoding);
}