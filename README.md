# spin-wallet
Wallet API for SPIN Protocol projects

## Installing dependencies

```
# Install nvm
brew install nvm

# Install node.js
nvm node v8.12.0

# Install node modules (run in the project directory)
npm install

# Install browserify
npm install -g browserify

```

## Building

1. Clone sub-project to your local `git clone https://github.com/spinprotocol/ethers.js.git`
2. `nvm use v8.12.0`
3. Install sub-project as an npm module locally `npm link <path_to_sub_project/ethers.js>`
4. Export Spin Token address for the corresponding network use `export TOKEN_ADDRESS="<token goes here>"`
5. `npm run dist`
6. And copy `dist/bundle.min.js` file to your project


## Test

1. Clone sub-project to your local `git clone https://github.com/spinprotocol/ethers.js.git`
2. `nvm use v8.12.0`
3. Install sub-project as an npm module locally `npm link <path_to_sub_project/ethers.js>`
4. Export your test network mnemonics `export MNEMONICS=<your seed phrase goes here>`
5. Export the test network you wan to use `export NETWORK=<network name goes here>`
6. Also export the Spin token address corresponding to the network you wan to use `export TOKEN_ADDRESS=<token goes here>`
7. Finally run all the tests `npm test`