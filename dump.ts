import { ExecutionContext, Graph, HashMapDataset, PipelineStage, PlanBuilder } from "sparql-engine";
import { QueryOutput } from "sparql-engine/dist/engine/plan-builder";

export function dump(graph : Graph) {
    // TODO: Verify that db exists?
    
    //graph.find({ subject : "?s", predicate : "?p", object : "?o"}, new ExecutionContext())
    const query = `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT ?name
    WHERE {
      ?s a foaf:Person .
      ?s foaf:name ?name .
    }`

    const dataset = new HashMapDataset('http://example.org#default', graph);
    
    // Creates a plan builder for the RDF dataset
    const builder = new PlanBuilder(dataset)

    // Get an iterator to evaluate the query
    const iterator = builder.build(query) as PipelineStage<QueryOutput>;

    // Read results
    iterator.subscribe(
        bindings => console.log(bindings),
        err => console.error(err),
        () => console.log('Query evaluation complete!')
    );
}