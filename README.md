# spin-wallet
Wallet API for SPIN Protocol projects

## Installing dependencies

```sh
# Install nvm
$ brew install nvm

# Install node.js
$ nvm node v8.12.0

# Install node modules (run in the project directory)
$ npm install

# Install ethers module
# 1. Clone sub-project to your local git clone 
# 2. And install ethers npm module locally 
$ git clone  https://github.com/spinprotocol/ethers.js.git
$ npm link <path_to_sub_project/ethers.js>

# Install browserify
$ npm install -g browserify

```

## Building

1. Export Spin Token address for the corresponding network use `$ export TOKEN_ADDRESS="<token address goes here>"`
2. `$ npm run dist`
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

1. Export your test network mnemonics `$ export MNEMONICS=<your seed phrase goes here>`
2. Export the test network you wan to use `$ export NETWORK=<network name goes here>`
3. Export the Spin token address corresponding to the network you wan to use `$ export TOKEN_ADDRESS=<token address goes here>`
4. Finally run all the tests `$ npm test`


## Demo

1. Export Spin Token address for the corresponding network use `$ export TOKEN_ADDRESS="<token address goes here>"`
2. `$ npm run dist`
3. And open `demo/index.html` file in your browser


## API Functions
```javascript
  /**
   * Creates BIP44 compliant HD wallet.
   * @returns {SpinWallet}
   */
  function createWallet()

  /**
   * Restores BIP44 compliant HD wallet from 12-word mnemonic sentence (BIP39).
   * 
   * @param {string} mnemonics 12-word mnemonic sentence
   * @returns {SpinWallet}
   */
  function restoreWalletFromMnemonics(mnemonics)

  /**
   * Restores BIP44 compliant HD wallet from private key.
   * 
   * @param {string} privateKey Private key in the form of hex string (32-byte)
   * @returns {SpinWallet}
   */
  function restoreWalletFromPrivateKey(privateKey)

  /**
   * Restores BIP44 compliant HD wallet from encrypted json wallet.
   * @see https://docs.ethers.io/ethers.js/html/api-wallet.html for json wallet format
   * 
   * @param {string} vault Encrypted json wallet
   * @param {string} password Password to decrypt the encrypted json wallet
   * @param {function} [cb] Callback function called with the progress ratio in every second
   * @returns {SpinWallet}
   */
  async function restoreWalletFromVault(vault, password, cb)

  /**
   * Saves the encrypted wallet to the browser's storage.
   * @see https://localforage.github.io/localForage/#settings-api-setdriver
   * for the storage being utilized
   * 
   * @param {string} encryptedJsonWallet 
   */
  function saveVault(encryptedJsonWallet)

  /**
   * @returns {Promise<string>} Resolves with the vault retrieved from the browser's storage
   */
  function retrieveVault()

  /**
   * Clears the vault saved in the Browser's storage
   */
  function clearVault()


  /**
   * Connects to the desired network, if no network name
   * is provided, connects to `homestead` (Ethereum mainnet) by default.
   * 
   * @param {string} [network='homestead'] Network name
   */
  SpinWallet.connect(network='homestead')
  /**
   * Encrypts `wallet` with `password` and
   * returns encrypted wallet in json string format.
   * 
   * @param {string} password
   * @return {Promise<string>} Resolves with the encrypted wallet in json string
   */
  SpinWallet.lock(password, cb)

  /**
   * Decrypts encrypted wallet (which is in json string form) with `password`.
   * 
   * @param {string} password
   */
  SpinWallet.unlock(password, cb)

  /**
   * @returns {boolean} Whether this wallet is locked or not
   */
  SpinWallet.isLocked()

  /**
   * @returns {string} 12-word mnemonic sentence of this wallet
   */
  SpinWallet.getMnemonics()

  /**
   * @returns {string} Private key of this wallet
   */
  SpinWallet.getPrivateKey()

  /**
   * @returns {string} Primary public address of this wallet
   */
  SpinWallet.getAddress()

  /**
   * @returns {string} Connected network's name
   */
  SpinWallet.getNetwork()

  /**
   * @returns {object} RPC provider
   */
  SpinWallet.getProvider()

  /**
   * @returns {Promise<string>} Resolves with the ether balance of this wallet's primary address
   */
  SpinWallet.getEtherBalance()

  /**
   * Adds a new token interface to the wallet
   * 
   * @param {string} symbol Symbol of the token to be added
   * @param {string} address Address of the token contract
   * @param {number|string} decimals Decimal unit of the token to be added
   * @throws Throws an error if this wallet is not connected to any network
   */
  SpinWallet.addToken(symbol, address, decimals)

  /**
   * Removes the matching token interface from the wallet
   * 
   * @param {string} address Address of the token contract
   */
  SpinWallet.removeToken(address)

  /**
   * @param {string} tokenAddress Address of the token contract
   * @returns {Promise<number|string>} Resolves with the corresponding token balance of this wallet's primary address
   */
  SpinWallet.getTokenBalance(tokenAddress)

  /**
   * @param {string} to 
   * @param {string|number} amount 
   * @returns Resolves with the transaction receipt
   */
  SpinWallet.sendEther(to, amount)

  /**
   * @param {string} to 
   * @param {string|number} amount 
   * @returns Resolves with the transaction receipt once the tx is mined
   */
  SpinWallet.sendToken(tokenAddress, to, amount)

  /**
   * Signs the given transaction data. All fields are
   * optional in the transaction object. All numbers which
   * exceeds 15 decimals should be provided in hex string.
   * 
   * @param {{to:string,nonce:number,gasLimit:number,gasPrice:number,data:string,value:number,chainId:number}} tx
   * @returns {Promise<string>} Resolves with the tx signature
   */
  SpinWallet.sign(tx)

  /**
   * Signs the given message with this wallet's private key.
   * 
   * @param {string} message 
   * @returns {Promise<string>} Resolves with the message signature
   */
  SpinWallet.signMessage(message)
```