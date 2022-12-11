import sparqlConverter from 'json-rql-sparql'

import { getStorage, GraphClass, Triple } from './graph/index.js'
import { IPLD, LinkedDataGraph, resolveQuery } from './graph/common.js';
import { getInput, getStringInput } from './input.js';
import { QueryOptions, QuerySyntax } from './cli/query/options.js';
import createIpfs from './ipfs.js';
import * as Logger from './logger.js';
import _ from 'lodash';

async function getQueryString(options: QueryOptions, ipfs_client: any): Promise<string> {
    switch (options.syntax) {
        case QuerySyntax.Sparql: {
            return getStringInput(options.input, ipfs_client);
        }
        case QuerySyntax.JsonRql: {
            const context = { "@context": { "@vocab" : "https://mizu.stream/" } };
            const queryJson = await getInput(options.input, ipfs_client);
            if (_.isString(queryJson)) {
                throw "Query input must be an object when query type is JsonRQL. Did you mean to pass --syntax sparql?"
            }
            if (!_.isObject(queryJson)) {
                throw "Query input must be an object when query type is JsonRQL."
            }
            return new Promise<string>((resolve, reject) => {
                const message = { ...context, ...queryJson};
                console.log(message);
                sparqlConverter.toSparql(message, (err, sparql) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (!_.isString(sparql)) {
                            reject(`Internal Error: Expected jason-rql-sparql to return string, got ${sparql}`);
                        }
                        resolve(sparql);
                    }
                });
            }).catch((reason) => Promise.reject(`json-rql-sparql converter failed with error ${reason}`));
        }
    }
}

export async function queryCommand(options: QueryOptions) {
    const ipfs_client = await createIpfs(options.ipfsOptions);
    try {
        const queryString = await getQueryString(options, ipfs_client);
        Logger.info((log) => log(`Running query ${queryString}`));

        const GraphClass = getStorage(options.storageType);
        const graph = new GraphClass(options.databasePath);
        // const cid = (options.input.type == InputType.Cid) ? CID.parse(options.input.cid) : await ipfs_client.dag.put(dag);

        // TODO: Have mock persist between invocations.
        const results = await resolveQuery(graph, queryString);
        Logger.consoleLog(JSON.stringify(results, null, 2));

        return results;
    } finally {
        ipfs_client.stop();
    }
}