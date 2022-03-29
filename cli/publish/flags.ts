import BASE_FLAGS from '../flags'

const ADDED_FLAGS = {
    IS_PUBLIC: 'public'
}

const FLAGS = { ...BASE_FLAGS, ...ADDED_FLAGS }

export default FLAGS;