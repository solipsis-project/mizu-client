import BASE_FLAGS from '../flags.js'

const ADDED_FLAGS = {
    IS_PUBLIC: 'public',

    SIGN_PGP: 'pgp',
    SIGN_SSH: 'ssh'
}

const FLAGS = { ...BASE_FLAGS, ...ADDED_FLAGS }

export default FLAGS;