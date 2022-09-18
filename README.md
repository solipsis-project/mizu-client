# Mizu

Mizu: The decentralized database built on IPFS, libP2P, and json-rql, designed for connecting publishers and subscribers.

Think RSS meets Git meets Bittorrent.

Website: https://mizu.stream/

Matrix: [mizu:matrix.org](https://matrix.to/#/#mizu:matrix.org)

Discord: https://discord.gg/kEW32kWsaA

Build instructions:

1. Clone this repository and its submodules (`git clone --recurse-submodules https://github.com/solipsis-project/mizu-client`)

2a. Build the docker container (`DOCKER_BUILDKIT=1 docker build -f ./Dockerfile-linux --tag mizu .`)

2b. Alternatively, build the node package (`npm install && npm run build && npm install -g`)
