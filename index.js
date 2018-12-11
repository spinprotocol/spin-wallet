const ethers = require('ethers');
const _find = require('lodash.find');
const _remove = require('lodash.remove');
const localforage = require('localforage');
const Wallet = ethers.Wallet;
const NetworkStatsApi = require('./api/networkStatsApi');

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint)',
  'function transfer(address to, uint256 amount)',
  'event Transfer(address indexed from, address indexed to, uint256 amount)'
];
const VAULT_NAME = '__spin_vault__';


function SpinWallet(wallet, encryptedJsonWallet) {
  if (!(this instanceof SpinWallet)) {
    return new SpinWallet(wallet, encryptedJsonWallet);
  }

  this.wallet = null;
  this.isLocked = true;
  this.tokens = [];
  this.provider = null;
  this.network = '';
  this.encryptedJsonWallet = encryptedJsonWallet || '';
  initWallet.call(this, wallet);

  function initWallet(wallet) {
    if (!wallet || !(wallet instanceof ethers.Signer)) {
      throw new Error('Wallet cannot be empty! Wallet should be an instance of ethers.Signer!');
    }
    this.wallet = wallet;
    this.isLocked = false;
  }

  /**
   * Connects to the desired network, if no network name
   * is provided, connects to `homestead` (Ethereum mainnet) by default.
   * 
   * @param {string} [network='homestead'] Network name
   */
  function connect(network='homestead') {
    if (!this.wallet) {
      throw new Error('Wallet is null! You cannot connect to the network without a wallet!');
    }

    this.provider = ethers.getDefaultProvider(network);
    this.network = network;
    this.wallet = this.wallet.connect(this.provider);

    // Add SPIN Token by default
    // FIXME: Token information should be replaced with the correct ones
    addToken.call(this, 'SPIN', '0x668D6D1a5be72dC477C630DE38aaEDc895e5019C', 18);
  }

  /**
   * Encrypts `wallet` with `password` and
   * returns encrypted wallet in json string format.
   * 
   * @param {string} password
   * @return {Promise<string>} Resolves with the encrypted wallet in json string
   */
  async function lock(password, cb) {
    // Encrypt the wallet if there is no encrypted wallet
    if (!this.encryptedJsonWallet) {
      let encryptedWallet = await this.wallet.encrypt(password, {}, cb);
      this.encryptedJsonWallet = encryptedWallet;
    }
    this.wallet = null;
    this.isLocked = true;
    this.provider = null;
    this.tokens = [];
    this.network = '';
    
    return this.encryptedJsonWallet;
  }

  /**
   * Decrypts encrypted wallet (which is in json string form) with `password`.
   * 
   * @param {string} password
   */
  async function unlock(password, cb) {
    let wallet = await Wallet.fromEncryptedJson(this.encryptedJsonWallet, password, cb);
    initWallet.call(this, wallet);
    return true;
  }

  /**
   * @returns {boolean} Whether this wallet is locked or not
   */
  function isLocked() {
    return this.isLocked;
  }

  /**
   * @returns {string} 12-word mnemonic sentence of this wallet
   */
  function getMnemonics() {
    if (this.isLocked) {
      throw new Error('Wallet is locked!');
    }

    return this.wallet.mnemonic;
  }

  /**
   * @returns {string} Private key of this wallet
   */
  function getPrivateKey() {
    if (this.isLocked) {
      throw new Error('Wallet is locked!');
    }

    return this.wallet.privateKey;
  }

  /**
   * @returns {string} Primary public address of this wallet
   */
  function getAddress() {
    if (this.isLocked) {
      throw new Error('Wallet is locked!');
    }

    return this.wallet.address;
  }

  /**
   * @returns {string} Connected network's name
   */
  function getNetwork() {
    return this.network;
  }

  /**
   * @returns {object} RPC provider
   */
  function getProvider() {
    return this.provider;
  }

  /**
   * @returns {Promise<string>} Resolves with the ether balance of this wallet's primary address
   */
  async function getEtherBalance() {
    if (this.isLocked) {
      return Promise.reject(new Error('Wallet is locked!'));
    }

    let wei = await this.wallet.getBalance();
    return ethers.utils.formatEther(wei);
  }

  /**
   * Adds a new token interface to the wallet
   * 
   * @param {string} symbol Symbol of the token to be added
   * @param {string} address Address of the token contract
   * @param {number|string} decimals Decimal unit of the token to be added
   * @throws Throws an error if this wallet is not connected to any network
   */
  function addToken(symbol, address, decimals) {
    if (this.isLocked) {
      throw new Error('Wallet is locked!');
    }

    if (_find(this.tokens, token => token.address === address)) {
      return;
    }

    let contract = createERC20TokenContract(this.wallet, address);
    let oneToken = ethers.utils.bigNumberify('10').pow(decimals);
    this.tokens.push({
      symbol,
      address,
      decimals,
      oneToken,
      contract
    });
  }

  /**
   * Removes the matching token interface from the wallet
   * 
   * @param {string} address Address of the token contract
   */
  function removeToken(address) {
    if (this.isLocked) {
      throw new Error('Wallet is locked!');
    }

    if (!_find(this.tokens, token => token.address === address)) {
      return;
    }
    _remove(this.tokens, token => token.address === address);
  }

  /**
   * @param {string} tokenAddress Address of the token contract
   * @returns {Promise<number|string>} Resolves with the corresponding token balance of this wallet's primary address
   */
  async function getTokenBalance(tokenAddress) {
    if (this.isLocked) {
      return Promise.reject(new Error('Wallet is locked!'));
    }

    let token = _find(this.tokens, token => token.address === tokenAddress);

    if (!token) {
      return Promise.reject(new Error('Token does not exist!'));
    }

    let balance = await token.contract.balanceOf(this.wallet.address);
    return balance.div(token.oneToken);
  }

  /**
   * @param {string} to 
   * @param {string|number} amount 
   * @returns Resolves with the transaction receipt
   */
  async function sendEther(to, amount) {
    if (this.isLocked) {
      return Promise.reject(new Error('Wallet is locked!'));
    }

    // Validate recipient address
    try {
      ethers.utils.getAddress(to)
    } catch (e) {
      return Promise.reject(new Error('Invalid Ethereum address!'));
    }

    let { average } = await NetworkStatsApi.getGasPriceStats();

    let value = ethers.utils.parseEther(amount);
    let tx = await this.wallet.sendTransaction({to, value, gasPrice: average});
    return (await tx.wait());
  }

  /**
   * @param {string} to 
   * @param {string|number} amount 
   * @returns Resolves with the transaction receipt once the tx is mined
   */
  async function sendToken(tokenAddress, to, amount) {
    if (this.isLocked) {
      return Promise.reject(new Error('Wallet is locked!'));
    }

    let token = _find(this.tokens, token => token.address === tokenAddress);

    if (!token) {
      return Promise.reject(new Error('Token does not exist!'));
    }

    // Validate recipient address
    try {
      ethers.utils.getAddress(to)
    } catch (e) {
      return Promise.reject(new Error('Invalid Ethereum address!'));
    }

    let { average } = await NetworkStatsApi.getGasPriceStats();

    amount = new ethers.utils.BigNumber(amount);
    amount = amount.mul(token.oneToken).toString(10);

    let tx = await token.contract.transfer(to, amount, {gasPrice: average});

    return (await tx.wait());
  }

  /**
   * Signs the given transaction data. All fields are
   * optional in the transaction object. All numbers which
   * exceeds 15 decimals should be provided in hex string.
   * 
   * @param {{to:string,nonce:number,gasLimit:number,gasPrice:number,data:string,value:number,chainId:number}} tx
   * @returns {Promise<string>} Resolves with the tx signature
   */
  function sign(tx) {
    if (this.isLocked) {
      return Promise.reject(new Error('Wallet is locked!'));
    }
    return this.wallet.sign(tx);
  }

  /**
   * Signs the given message with this wallet's private key.
   * 
   * @param {string} message 
   * @returns {Promise<string>} Resolves with the message signature
   */
  function signMessage(message) {
    if (this.isLocked) {
      return Promise.reject(new Error('Wallet is locked!'));
    }
    return this.wallet.signMessage(message);
  }

  return Object.freeze({
    connect: connect.bind(this),
    lock: lock.bind(this),
    unlock: unlock.bind(this),
    isLocked: isLocked.bind(this),
    getMnemonics: getMnemonics.bind(this),
    getPrivateKey: getPrivateKey.bind(this),
    getAddress: getAddress.bind(this),
    getNetwork: getNetwork.bind(this),
    getProvider: getProvider.bind(this),
    getEtherBalance: getEtherBalance.bind(this),
    getTokenBalance: getTokenBalance.bind(this),
    addToken: addToken.bind(this),
    removeToken: removeToken.bind(this),
    sendEther: sendEther.bind(this),
    sendToken: sendToken.bind(this),
    sign: sign.bind(this),
    signMessage: signMessage.bind(this)
  });
}

function createERC20TokenContract(signer, address) {
  if (!signer || !signer.provider) {
    throw new Error('There is no signer or network provider!');
  }

  return new ethers.Contract(address, ERC20_ABI, signer);
}

/**
 * Creates BIP44 compliant HD wallet.
 * @returns {SpinWallet}
 */
function createWallet() {
  return new SpinWallet(Wallet.createRandom());
}

/**
 * Restores BIP44 compliant HD wallet from 12-word mnemonic sentence (BIP39).
 * 
 * @param {string} mnemonics 12-word mnemonic sentence
 * @returns {SpinWallet}
 */
function restoreWalletFromMnemonics(mnemonics) {
  return new SpinWallet(Wallet.fromMnemonic(mnemonics));
}

/**
 * Restores BIP44 compliant HD wallet from private key.
 * 
 * @param {string} privateKey Private key in the form of hex string (32-byte)
 * @returns {SpinWallet}
 */
function restoreWalletFromPrivateKey(privateKey) {
  return new SpinWallet(new Wallet(privateKey));
}

/**
 * Restores BIP44 compliant HD wallet from encrypted json wallet.
 * @see https://docs.ethers.io/ethers.js/html/api-wallet.html for json wallet format
 * 
 * @param {string} vault Private key in the form of hex string (32-byte)
 * @param {string} password Password to decrypt the encrypted json wallet
 * @param {function} [cb] Callback function called with the progress ratio in every second
 * @returns {SpinWallet}
 */
async function restoreWalletFromVault(vault, password, cb) {
  let wallet = await Wallet.fromEncryptedJson(vault, password, cb);
  return new SpinWallet(wallet, vault);
}

/**
 * Clears the vault saved in the Browser's storage
 */
function clearVault() {
  return localforage.removeItem(VAULT_NAME);
}

/**
 * Saves the encrypted wallet to the browser's storage.
 * @see https://localforage.github.io/localForage/#settings-api-setdriver
 * for the storage being utilized
 * 
 * @param {string} encryptedJsonWallet 
 */
function saveVault(encryptedJsonWallet) {
  return localforage.setItem(VAULT_NAME, encryptedJsonWallet);
}

/**
 * @returns {Promise<string>} Resolves with the vault retrieved from the browser's storage
 */
function retrieveVault() {
  return localforage.getItem(VAULT_NAME);
}

module.exports = {
  SpinWallet,
  createWallet,
  restoreWalletFromMnemonics,
  restoreWalletFromPrivateKey,
  restoreWalletFromVault,
  saveVault,
  retrieveVault,
  clearVault
};
