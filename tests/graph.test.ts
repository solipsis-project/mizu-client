import fs from 'fs'
import path from 'path'

import { Pipeline, HashMapDataset, PlanBuilder, PipelineStage } from 'sparql-engine'

import { makeTriple } from '../graph'
import { N3Graph } from '../graph/n3'
import { LevelRDFGraph } from '../graph/levelgraph'
import { resolveQuery } from '../graph/common'

const tempContainingDir = `.${path.sep}temp${path.sep}`

async function clearTempFiles() : Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.rm(tempContainingDir, { recursive : true, force : true }, (err) => {
            if (err) {
                reject(err);
            } else {
                fs.mkdirSync(tempContainingDir);
                resolve();
            }
        });
    });
}

beforeAll(async () => {
    await clearTempFiles();
});

async function withTempDir(dbPath : string, callback) {
    const tempDir = fs.mkdtempSync(`${dbPath}${path.sep}`);
    fs.mkdirSync(tempDir);
    await callback(tempDir)
    fs.rmSync(tempDir, { recursive : true, force : true});
}

describe.each([ N3Graph, LevelRDFGraph])("Graph tests %O", (GraphClass) => {
    test('single insert', async () => {    
        withTempDir(tempContainingDir, async (tempDir) => {
            const dbPath = `${tempDir}${path.sep}db`;
            const graph = new GraphClass(dbPath);
            expect(await graph.count()).toBe(0);
            await graph.insert(makeTriple('a', 'b', 'c'));
            expect(await graph.count()).toBe(1);

            const query = `
            SELECT ?s
            WHERE {
            ?s ?p ?o
            }`
            const results = await resolveQuery(graph, query)
            expect(results).toEqual([{ '?s' : 'a' }]);
        });
    });

    test('multiple inserts', async () => {   
        withTempDir(tempContainingDir, async (tempDir) => { 
            const dbPath = `${tempDir}${path.sep}db`;
            const graph = new GraphClass(dbPath);
            expect(await graph.count()).toBe(0);
            await graph.insert(makeTriple('a', 'b', 'c'));
            expect(await graph.count()).toBe(1);
            await graph.insert(makeTriple('d', 'e', 'f'));
            expect(await graph.count()).toBe(2);

            const query = `
            SELECT ?s
            WHERE {
            ?s ?p ?o
            }`
            const results = await resolveQuery(graph, query)
            expect(results).toEqual([{ '?s' : 'a' }, { '?s' : 'd'}]);
        });
    });
});