import BASE_FLAGS from '../flags'

const ADDED_FLAGS = {
    COMMAND_NAME : 'publish',
    PUBLISH_FILE : 'file',
    PUBLISH_CID : 'cid',
    PUBLISH_STDIN : 'stdin',
}

const FLAGS = { ...BASE_FLAGS, ...ADDED_FLAGS } 

export default FLAGS;