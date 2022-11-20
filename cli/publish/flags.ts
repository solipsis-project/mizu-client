import BASE_FLAGS from '../flags.js'

const ADDED_FLAGS = {
    IS_PUBLIC: 'public',

    SIGN_PEM: 'pem',
    SIGN_PGP: 'pgp'
} as const;

const FLAGS = { ...BASE_FLAGS, ...ADDED_FLAGS }

export default FLAGS;