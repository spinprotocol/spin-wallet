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

# Install ethers module
  1. Clone sub-project to your local git clone 
    https://github.com/spinprotocol/ethers.js.git
  2. And install ethers npm module locally 
    npm link <path_to_sub_project/ethers.js>

# Install browserify
npm install -g browserify

```

## Building

1. Export Spin Token address for the corresponding network use `export TOKEN_ADDRESS="<token address goes here>"`
2. `npm run dist`
3. Copy `dist/spin.min.js` file to your project and import it
```html
  <script charset="utf-8" src="/.../spin.min.js" type="text/javascript"></script>
  <script type="text/javascript">
    ...
    spin.restoreWalletFromMnemonics(mnemonics);
    ...
  </script>
```
For module use, simply import/require `dist/spin.js`
```javascript
  import * as spin from 'dist/spin';
  const spin = require('dist/spin');
  ...
  spin.restoreWalletFromMnemonics(mnemonics);
  ...
```

## Test

1. Export your test network mnemonics `export MNEMONICS=<your seed phrase goes here>`
2. Export the test network you wan to use `export NETWORK=<network name goes here>`
3. Also export the Spin token address corresponding to the network you wan to use `export TOKEN_ADDRESS=<token address goes here>`
4. Finally run all the tests `npm test`


## Demo

1. Export Spin Token address for the corresponding network use `export TOKEN_ADDRESS="<token address goes here>"`
2. `npm run build-demo`
3. And open `demo/index.html` file in your browser