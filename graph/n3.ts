'use strict'

import N3 from 'n3'
import { HashMapDataset, Graph, PlanBuilder, ExecutionContext, PipelineInput } from 'sparql-engine'
import fs from 'fs';
import stream from 'stream';

import { IPLD, LinkedDataGraph, resolveQuery, Triple } from './common.js';
import dagToTriples from './dagToTriples.js';
import triplesToDag from './triplesToDag.js';
import { CID } from 'multiformats';
import normalizePath from '../normalizePath.js';

// Based on sparql-engine/blob/master/examples/n3.js

// Format a triple pattern according to N3 API:
// SPARQL variables must be replaced by `null` values
function formatTriplePattern(triple: Triple): Triple {
  let subject = null
  let predicate = null
  let object = null
  if (!triple.subject.startsWith('?')) {
    subject = triple.subject
  }
  if (!triple.predicate.startsWith('?')) {
    predicate = triple.predicate
  }
  if (!triple.object.startsWith('?')) {
    object = triple.object
  }
  return { subject, predicate, object }
}

export class N3Graph extends Graph implements LinkedDataGraph {

  _store: N3.N3StoreWriter;

  constructor(dbPath: string) {
    super();
    this._store = N3.Store();
    if (fs.existsSync(dbPath)) {
      const content = fs.readFileSync(dbPath).toString('utf-8')
      N3.Parser().parse(content).forEach(t => {
        this._store.addTriple(t)
      });
    }
    /*
    const streamParser = N3.StreamParser();
    const dbInputStream = fs.createReadStream(dbPath);
    streamParser.parse(dbInputStream, console.log);*/
  }

  // Methods inherited from Graph

  async insert(triple: Triple) {
    this._store.addTriple(triple);
  }

  async delete(triple: Triple) {
    this._store.removeTriple(triple);
  }

  find(triple: Triple = { subject: "?s", predicate: "?p", object: "?o" }, context?: ExecutionContext): PipelineInput<Triple> {
    const formattedTriple = formatTriplePattern(triple)
    return this._store.getTriples(formattedTriple);
  }

  clear(): Promise<void> {
    const triples = this._store.getTriples(null, null, null)
    this._store.removeTriples(triples)
    return Promise.resolve()
  }

  // Methods inherited from LinkedDataGraph

  count(triple?: Triple) {
    if (!triple) {
      return Promise.resolve(this._store.size);
    }
    const formattedTriple = formatTriplePattern(triple)
    return Promise.resolve(this._store.countTriples(formattedTriple))
  }

  get forEach() {
    return this._store.forEach;
  }

  async putIPLD(path: string, dag: IPLD): Promise<void> {
    for await (const triple of dagToTriples(path, dag, false)) {
      console.log(triple);
      await this.insert(triple);
    }
  }

  async getIPLD(root: string, follow_links = false): Promise<IPLD> {
    // Compute the root subject.
    // Find all its properties
    // Make new queries for them.
    // Be sure to detect cycles.
    // TODO: We make a dag of the entire datastore. This is slow because it implicitly follows all links.
    // Making as-needed queries is probably better.
    /*
    return triplesToDag(root, this.find() as Triple[], follow_links);
    */
    // this.find({ subject : root, predicate : '?p', object '?o'})
    const subjects = new Map<string, IPLD>();
    const graph = this;

    async function getSubject(subject: string): Promise<IPLD> {
      if (subjects.has(subject)) {
        return subjects.get(subject);
      }
      const subjectLinkedData = {};
      subjects.set(subject, subjectLinkedData);
      // TODO: why does this return every record in the datastore?
      const query = `
      PREFIX MIZU: <https://mizu.io/>
      SELECT ?p ?o
      WHERE {
      <${subject}> ?p ?o
      }`;
      console.log(query);
      for (const result of await resolveQuery(graph, query)) {
        console.log(result);
        const resultLinkedData = await getSubject(result['?o']);
        subjectLinkedData[result['?p']] = resultLinkedData;
      }
      return subjectLinkedData;
    }

    return getSubject(root);
  }

  async load(dbPath: string): Promise<void> {
    const content = fs.readFileSync(dbPath).toString('utf-8')
    N3.Parser().parse(content).forEach(t => {
      this._store.addTriple(t)
    });
  }

  async save(dbPath: string) {
    // Create a single backup in case something catastophic happens.
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, dbPath + '.bak');
    }
    const outputStream = fs.createWriteStream(dbPath);
    /*
    const writer = N3.Writer(outputStream, { prefixes: { c: 'http://example.org/cartoons#' } });
    this._store.forEach((quad) => {
      console.log(quad);
      writer.addTriple(quad);
    });
    /*this._store.getTriples(null, null, null).forEach((triple) => {
      console.log(triple);
      writer.addTriple(triple)
    });*/
    // writer.end();

    /*
    var streamParser = new N3.StreamParser(),
    inputStream = fs.createReadStream('cartoons.ttl'),
    streamWriter = new N3.StreamWriter({ prefixes: { c: 'http://example.org/cartoons#' } });
    inputStream.pipe(streamParser);
    streamParser.pipe(streamWriter);
    streamWriter.pipe(outputStream);*/
  }
}