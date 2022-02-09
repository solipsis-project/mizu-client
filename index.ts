import yargs, { alias } from 'yargs';
import { hideBin } from 'yargs/helpers';

import { Graph } from 'sparql-engine';
import { N3Graph } from './n3/graph';
import { LevelRDFGraph } from './levelgraph/graph';

type GraphClass = (new(db: any) => Graph);

const FLAG_N3 = 'n3'
const FLAG_LEVELGRAPH = 'levelgraph'

function getStorage(storageType : string) : GraphClass {
    switch (storageType) {
        case FLAG_N3:
            return N3Graph;
        case FLAG_LEVELGRAPH:
            return LevelRDFGraph;
    }
}

function publish(graphClass : GraphClass, message? : JSON) {

}

const args = yargs(hideBin(process.argv))
    .option('storage', {
        choices : [FLAG_N3, FLAG_LEVELGRAPH]
    })
    .command('publish', 'publish a new message to this node',
        function (yargs) {
            return yargs.boolean('public')
        },
        function (argv) {
            publish(getStorage(argv.storage), null);
        }
    )
    .demandOption('storage').parse();

