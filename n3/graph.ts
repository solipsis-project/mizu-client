'use strict'

import N3 from 'n3'
import { HashMapDataset, Graph, PlanBuilder } from 'sparql-engine'
import fs from 'fs';
import stream from 'stream';
import { Quad } from 'rdf-js';

// Based on sparql-engine/blob/master/examples/n3.js

// Format a triple pattern according to N3 API:
// SPARQL variables must be replaced by `null` values
function formatTriplePattern (triple) {
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

export class N3Graph extends Graph {

  _store : N3.Store;

  constructor (dbPath : string) {
    super()
    const store = new N3.Store();
    const streamParser = new N3.StreamParser();
    const dbInputStream = fs.createReadStream(dbPath);
    dbInputStream.pipe(streamParser);
    streamParser.pipe(new class extends stream.Writable {
      _write(quad: Quad, encoding, done) {
        store.add(quad);
      }
    }({ objectMode: true }));
    this._store = store;
  }

  insert (triple) {
    return new Promise<void>((resolve, reject) => {
      try {
        this._store.addQuad(triple.subject, triple.predicate, triple.object)
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  delete (triple) {
    return new Promise<void>((resolve, reject) => {
      try {
        this._store.removeQuad(triple.subject, triple.predicate, triple.object)
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  find (triple) {
    const { subject, predicate, object } = formatTriplePattern(triple)
    return this._store.getQuads(subject, predicate, object, null)
  }

  estimateCardinality (triple) {
    const { subject, predicate, object } = formatTriplePattern(triple)
    return Promise.resolve(this._store.countQuads(subject, predicate, object, null))
  }

  clear(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  save(dbPath : string) {
    // Create a single backup in case something catastophic happens.
    fs.copyFileSync(dbPath, dbPath + '.bak');
    const outputStream = fs.createWriteStream(dbPath);
    const writer = new N3.Writer(outputStream, { end: false, prefixes: { c: 'http://example.org/cartoons#' } });
    this._store.forEach((quad) => (writer.addQuad(quad)), null, null, null, null);
  }
}