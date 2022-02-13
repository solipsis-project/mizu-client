'use strict'

import { BindingBase, Graph, Pipeline, ExecutionContext, StreamPipelineInput, Bindings, PipelineInput, PipelineStage } from 'sparql-engine'
import level from 'level'
const levelgraph = require('levelgraph')
import jsonld from 'levelgraph-jsonld'

import { IPLD, LinkedDataGraph, Triple } from './common'
import { CID } from 'multiformats/cid'

// Based on sparql-engine/blob/master/examples/levelgraph.js

function generateIds(cid : CID, dag : IPLD) : IPLD {
  return dag;
}

export class LevelRDFGraph extends Graph implements LinkedDataGraph {
  _db : any;
  
  constructor (dbPath : string) {
    super();
  }

  putIPLD(cid: CID, dag: IPLD): Promise<void> {
    return this._db.jsonld.put(generateIds(cid, dag), (err, obj) => {
      if (err) {
        throw err;
      }
      return obj;
    });
  }

  getIPLD(cid: CID, path: string): Promise<IPLD> {
    return new Promise<IPLD>((resolve, reject) => {
      this._db.jsonld.get(`${cid.toString}/${path}`, {}, function(err, obj) {
        if(err) {
          reject(err);
        }
        resolve(obj);
      });
    });
  }

  async load(dbPath : string) {
    const localThis = this;
    await new Promise<void>((resolve, reject) => {
      localThis._db = jsonld(levelgraph(level(dbPath, function (err) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve();
        }
      })));
    }); 
  }

  evalBGP (bgp: Triple[], context: ExecutionContext) : PipelineStage<Bindings> {
    // Connect the Node.js Readable stream
    // into the SPARQL query engine using the fromAsync method
    return Pipeline.getInstance().fromAsync((input : StreamPipelineInput<Bindings>) => {
      // rewrite variables using levelgraph API
      bgp = bgp.map(t => {
        if (t.subject.startsWith('?')) {
          console.log("VARIABLE SUBJECT");
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


  insert (triple : Triple) {
    // TODO: Configure combination of backend/storage (using levelgraph-n3 and levelgraph-jsonld)
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

  delete (triple : Triple) {
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

  find(pattern: Triple, context? : ExecutionContext): PipelineInput<any> {
    return new Promise<any>((resolve, reject) => {
      this._db.get(pattern, function(err, list) {
        if (err) {
          reject(err);
        } else {
          console.log(list);
          resolve(list);
        }
      });
    });
  }

  estimateCardinality (triple : Triple) {
    return new Promise<any>((resolve, reject) => {
      this._db.approximateSize(triple, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  clear(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async save(dbPath : string) {
    // Nothing needs to be done here, database is update automatically.
  }
}