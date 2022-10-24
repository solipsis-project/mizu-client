import fs from 'fs'
import path from 'path'

import { Pipeline, HashMapDataset, PlanBuilder, PipelineStage } from 'sparql-engine'

import { makeTriple } from '../graph'
import { N3Graph } from '../graph/n3'
import { LevelRDFGraph } from '../graph/levelgraph'
import { MockLinkedDataGraph } from '../graph/mocklinkeddatagraph'
import { resolveQuery } from '../graph/common'
import assert from 'assert';

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

for (const GraphClass of [MockLinkedDataGraph]) {
describe(`Graph tests ${GraphClass.name}`, () => {
    it('empty graph', async () => {
        await withTempDir(tempContainingDir, async (tempDir) => {
            const dbPath = `${tempDir}/db`;
            const graph = new GraphClass(dbPath);
            assert.deepEqual(await graph.count(), 0);

            const query = `
            SELECT ?s
            WHERE {
            ?s ?p ?o
            }`
            const results = await resolveQuery(graph, query)
            assert.deepEqual(results, []);
        });
    });

    it('single insert', async () => {
        await withTempDir(tempContainingDir, async (tempDir) => {
            const dbPath = `${tempDir}/db`;
            const graph = new GraphClass(dbPath);
            assert.deepEqual(await graph.count(), 0);
            await graph.insert(makeTriple(':a', ':b', ':c'));
            assert.deepEqual(await graph.count(), 1);

            const query = `
            SELECT ?s ?p ?o
            WHERE {
            ?s ?p ?o
            }`
            const results = await resolveQuery(graph, query)
            assert.deepEqual(results, [{ '?s': ':a', '?p': ':b', '?o': ':c' }]);
        });
    });

    it('multiple inserts', async () => {
        await withTempDir(tempContainingDir, async (tempDir) => {
            const dbPath = `${tempDir}/db`;
            const graph = new GraphClass(dbPath);
            assert.deepEqual(await graph.count(), 0);
            await graph.insert(makeTriple('https://mizu.stream/a', 'https://mizu.stream/b', 'https://mizu.stream/c'));
            assert.deepEqual(await graph.count(), 1);
            await graph.insert(makeTriple('https://mizu.stream/d', 'https://mizu.stream/e', 'https://mizu.stream/f'));
            assert.deepEqual(await graph.count(), 2);

            const query = `
            SELECT ?s
            WHERE {
            ?s ?p ?o
            }`
            const results = await resolveQuery(graph, query)
            assert.deepEqual(results, [{ '?s': 'https://mizu.stream/a' }, { '?s': 'https://mizu.stream/d' }]);

            const query2 = `
            SELECT *
            WHERE {
            <MIZU:a> ?p ?o
            }`
            // const results2 = await resolveQuery(graph, query2)
            // assert.deepEqual(results2, [{ '?p' : 'MIZU:b' , '?o' : 'MIZU:c'}]);
        });
    });

    it('inserting linked data', async () => {
        await withTempDir(tempContainingDir, async (tempDir) => {
            const dbPath = `${tempDir}/db`;
            const graph = new GraphClass(dbPath);
            assert.deepEqual(await graph.count(), 0);
            await graph.insert(makeTriple('a', 'b', 'c'));
            assert.deepEqual(await graph.count(), 1);
            await graph.insert(makeTriple('d', 'e', 'f'));
            assert.deepEqual(await graph.count(), 2);

            const query = `
            SELECT ?s
            WHERE {
            ?s ?p ?o
            }`
            const results = await resolveQuery(graph, query)
            assert.deepEqual(results, [{ '?s': 'a' }, { '?s': 'd' }]);
        });
    });
});
}