import fs from 'fs'
import path from 'path'

import { Pipeline, HashMapDataset, PlanBuilder, PipelineStage } from 'sparql-engine'

import { makeTriple } from '../graph'
import { N3Graph } from '../graph/n3'
import { LevelRDFGraph } from '../graph/levelgraph'
import { MockLinkedDataGraph } from '../graph/mocklinkeddatagraph'
import { resolveQuery } from '../graph/common'

const tempContainingDir = `./temp/`

async function clearTempFiles(createTestDir : boolean) : Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.rm(tempContainingDir, { recursive : true, force : true }, (err) => {
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

async function withTempDir(dbPath : string, callback) {
    const tempDir = fs.mkdtempSync(`${dbPath}/`);
    await callback(tempDir)
    fs.rmSync(tempDir, { recursive : true, force : true});
}

describe.each([ N3Graph, LevelRDFGraph, MockLinkedDataGraph ])("Graph tests %O", (GraphClass) => {
    test('empty graph', async () => {    
        await withTempDir(tempContainingDir, async (tempDir) => {
            const dbPath = `${tempDir}/db`;
            const graph = new GraphClass(dbPath);
            expect(await graph.count()).toBe(0);

            const query = `
            SELECT ?s
            WHERE {
            ?s ?p ?o
            }`
            const results = await resolveQuery(graph, query)
            expect(results).toEqual([]);
        });
    });

    test('single insert', async () => {    
        await withTempDir(tempContainingDir, async (tempDir) => {
            const dbPath = `${tempDir}/db`;
            const graph = new GraphClass(dbPath);
            expect(await graph.count()).toBe(0);
            console.log(await graph.getIPLD({ toString : () => ':a' }, ''));
            await graph.insert(makeTriple(':a', ':b', ':c'));
            expect(await graph.count()).toBe(1);
            console.log(await graph.getIPLD({ toString : () => ':a' }, ''));

            const query = `
            SELECT ?s ?p ?o
            WHERE {
            ?s ?p ?o
            }`
            const results = await resolveQuery(graph, query)
            expect(results).toEqual([{ '?s' : ':a', '?p' : ':b', '?o' : ':c' }]);
        });
    });

    test('multiple inserts', async () => {   
        await withTempDir(tempContainingDir, async (tempDir) => { 
            const dbPath = `${tempDir}/db`;
            const graph = new GraphClass(dbPath);
            expect(await graph.count()).toBe(0);
            await graph.insert(makeTriple('https://mizu.io/a', 'https://mizu.io/b', 'https://mizu.io/c'));
            expect(await graph.count()).toBe(1);
            console.log(await graph.getIPLD({ toString : () => 'https://mizu.io/a' }, ''));
            await graph.insert(makeTriple('https://mizu.io/d', 'https://mizu.io/e', 'https://mizu.io/f'));
            expect(await graph.count()).toBe(2);
            console.log(await graph.getIPLD({ toString : () => 'https://mizu.io/a' }, ''));

            const query = `
            SELECT ?s
            WHERE {
            ?s ?p ?o
            }`
            const results = await resolveQuery(graph, query)
            expect(results).toEqual([{ '?s' : 'https://mizu.io/a' }, { '?s' : 'https://mizu.io/d'}]);

            const query2 = `
            SELECT *
            WHERE {
            <MIZU:a> ?p ?o
            }`
            // const results2 = await resolveQuery(graph, query2)
            // expect(results2).toEqual([{ '?p' : 'MIZU:b' , '?o' : 'MIZU:c'}]);
        });
    });

    test('inserting linked data', async () => {   
        await withTempDir(tempContainingDir, async (tempDir) => { 
            const dbPath = `${tempDir}/db`;
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