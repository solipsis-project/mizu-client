'use strict'

import { BindingBase, HashMapDataset, Graph, PlanBuilder, Pipeline, ExecutionContext, StreamPipelineInput, Bindings, PipelineInput } from 'sparql-engine'
import level from 'level'
const levelgraph = require('levelgraph')

export class LevelRDFGraph extends Graph {
  _db : any;
  
  constructor (db) {
    super()
    this._db = db
  }

  evalBGP (bgp: any[], context: ExecutionContext) {
    // Connect the Node.js Readable stream
    // into the SPARQL query engine using the fromAsync method
    return Pipeline.getInstance().fromAsync((input : StreamPipelineInput<Bindings>) => {
      // rewrite variables using levelgraph API
      bgp = bgp.map(t => {
        if (t.subject.startsWith('?')) {
          t.subject = this._db.v(t.subject.substring(1))
        }
        if (t.predicate.startsWith('?')) {
          t.predicate = this._db.v(t.predicate.substring(1))
        }
        if (t.object.startsWith('?')) {
          t.object = this._db.v(t.object.substring(1))
        }
        return t
      })
      // Evaluates the BGP using Levelgraph stream API
      const stream = this._db.searchStream(bgp)

      // pipe results & errors into the query engine
      stream.on('error', err => input.error(err))
      stream.on('end', () => input.complete())
      // convert Levelgraph solutions into Bindings objects (the format used by sparql-engine)
      stream.on('data', results => input.next(BindingBase.fromObject(results)))
    })
  }


  insert (triple) {
    return new Promise<void>((resolve, reject) => {
      this._db.put(triple, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  delete (triple) {
    return new Promise<void>((resolve, reject) => {
      this._db.del(triple, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  find(pattern: any, context: ExecutionContext): PipelineInput<any> {
    throw new Error('Method not implemented.');
  }

  clear(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}