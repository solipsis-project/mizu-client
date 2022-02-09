'use strict'

import { Parser, Store } from 'n3'
import { HashMapDataset, Graph, PlanBuilder } from 'sparql-engine'

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

  _store : Store;

  constructor (store : Store) {
    super()
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
}