'use strict'

import { Graph, ExecutionContext } from 'sparql-engine'
import fs from 'fs';
import util from 'util';

import { IPLD, IPLDObject, IPLDValue, IRI, LinkedDataGraph, makeTriple, resolveQuery, Triple, unwrapTripleObjectsInObj } from './common.js';
import dagToTriples from './dagToTriples.js';
import triplesToDag from './triplesToDag.js';
import { CID } from 'multiformats';
import normalizePath from '../normalizePath.js';
import * as Logger from '../logger.js';
import _ from 'lodash';

// The simplest possible implementation of a triplestore and linked data graph.
// Useful for tests. Don't use this in production, obviously.

function isVariable(name: string): boolean {
  return name.startsWith('?');
}

export class MockLinkedDataGraph extends Graph implements LinkedDataGraph {

  triples: Array<Triple> = [];

  constructor(dbPath: string) {
    super();
    if (fs.existsSync(dbPath)) {
      this.load(dbPath);
    }
  }

  // Methods inherited from Graph

  insert(triple: Triple) {
    if (!_.find(this.triples, (e) => _.isEqual(e, triple))) {
      this.triples.push(triple);
    }
    return Promise.resolve();
  }

  delete(triple: Triple) {
    _.pullAllWith(this.triples, [triple], _.isEqual);
    return Promise.resolve();
  }

  find(pattern?: Triple, context?: ExecutionContext): Array<Triple> {
    if (!pattern) {
      return this.triples;
    }
    // Remove domain name from predicate, since we don't store it in the database.
    // Note that this assumes that the domain for the predicate will always be the Mizu IRI,
    // Which is true if only relative IRIs are used, since we set the base.
    const predicate = pattern.predicate.slice(IRI.length);
    var results = [];
    this.triples.forEach((triple) => {
      const subjectMatch = isVariable(pattern.subject) || (pattern.subject == triple.subject);
      const predicateMatch = isVariable(pattern.predicate) || (predicate == triple.predicate);
      const objectMatch = isVariable(pattern.object) || (pattern.object == triple.object);
      if (subjectMatch && predicateMatch && objectMatch) {
        results.push(triple);
      }
    });
    return results;
  }

  clear(): Promise<void> {
    this.triples = [];
    return Promise.resolve();
  }

  // Methods inherited from LinkedDataGraph

  count(pattern?: Triple) {
    if (!pattern) {
      return Promise.resolve(this.triples.length);
    }
    return Promise.resolve(this.find(pattern).length)
  }

  forEach(callback) {
    this.triples.forEach(callback);
    return Promise.resolve();
  }

  async putIPLD(root: string, dag: IPLD): Promise<void> {
    for await (const triple of dagToTriples(root, dag)) {
      // Logger.debug((logger) => logger("added triple: ", triple));
      await this.insert(triple);
    }
  }

  async getIPLD(root: string): Promise<IPLD> {
    // Compute the root subject.
    // Find all its properties
    // Make new queries for them.
    // Be sure to detect cycles.
    // TODO: We make a dag of the entire datastore. This is slow because it implicitly follows all links.
    // Making as-needed queries is probably better.

    if (true) {
      const unescapedDag = triplesToDag(root, Array.from(this.find())) as IPLD;
      return unwrapTripleObjectsInObj(unescapedDag);
    }

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
      SELECT ?p ?o
      WHERE {
      <${subject}> ?p ?o
      }`;
      for (const result of await resolveQuery(graph, query)) {
        const resultLinkedData = await getSubject(result['?o']);
        subjectLinkedData[result['?p']] = resultLinkedData;
      }
      return subjectLinkedData;
    }

    return getSubject(root);
  }

  async load(dbPath: string): Promise<void> {
    // This won't handle unescaped commas in data, but it's good enough for now.
    const content = fs.readFileSync(dbPath).toString('utf-8')
    var lineNumber = 0;
    content.split('\n').forEach((line) => {
      lineNumber++;
      const terms = line.split(new RegExp('(?<!\\\\),')).map((term) => term.replace("\\,", ","));
      if (terms.length == 0) {
        // Allow empty lines to ensure that we correctly parse a db with no records.
        return;
      }
      if (terms.length != 3) {
        throw `Error parsing mock database ${dbPath}: invalid line at line ${lineNumber}: expected 3 terms, found ${terms.length}.\n${line}`;
      }
      this.insert(makeTriple(terms[0], terms[1], terms[2]));
    })
  }

  async save(dbPath: string) {
    // Create a single backup in case something catastophic happens.
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, dbPath + '.bak');
    }
    var fileContent = Array.from<Triple>(this.triples).map((triple) =>
      [
        triple.subject.replace(",", "\\,"),
        triple.predicate.replace(",", "\\,"),
        triple.object.replace(",", "\\,")
      ].join(',')
    ).join('\n');
    const dbFile = fs.writeFileSync(dbPath, fileContent);
  }
}