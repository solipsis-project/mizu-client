import { GraphClass } from './graph'

export async function publish(graphClass : GraphClass, dag : Promise<unknown>) {
    // For now, just print the dag.
    console.log(await dag);
}