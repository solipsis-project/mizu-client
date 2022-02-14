import { N3Graph } from '../graph/n3'
import { LevelRDFGraph } from '../graph/levelgraph'

describe.each([ N3Graph, LevelRDFGraph])("Graph tests %O", (GraphClass) => {
    it('Instantiate', () => {    
        const dbPath = '';
        const graph = new GraphClass(dbPath);
        expect(graph.load).toBeDefined();
    });
});