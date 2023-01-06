import BASE_FLAGS from '../flags.js'

const ADDED_FLAGS = {
    SPARQL: "sparql",
    JSONRQL: "jsonrql"
} as const;

const FLAGS = { ...BASE_FLAGS, ...ADDED_FLAGS }

export default FLAGS;