const bytes = require('ethers/utils/bytes');
const hash = require('ethers/utils/hash');
const hdnode = require('ethers/utils/hdnode');
const keccak256 = require('ethers/utils/keccak256');
const properties = require('ethers/utils/properties');
const randomBytes = require('ethers/utils/random-bytes');
const signingKey = require('ethers/utils/signing-key');
const transaction_1 = require('ethers/utils/transaction');
const Signer = require('ethers').Signer;
const abstractProvider = require('ethers/providers/abstract-provider');
const errors = require('ethers/errors');
const encryptor = require('browser-passworder');


/**
 * Override for Wallet Api of ethers.js in which the only difference is
 * that the encryption/decryption algorithm for wallet
 */
class Wallet extends Signer {
  constructor(privateKey, provider) {
    super(privateKey, provider);
    errors.checkNew(this, Wallet);
    // Make sure we have a valid signing key
    if (signingKey.SigningKey.isSigningKey(privateKey)) {
      properties.defineReadOnly(this, 'signingKey', privateKey);
    } else {
      properties.defineReadOnly(this, 'signingKey', new signingKey.SigningKey(privateKey));
    }
    properties.defineReadOnly(this, 'provider', provider);

    this.address = this.signingKey.address;
    this.mnemonic = this.signingKey.mnemonic;
    this.path = this.signingKey.mnemonic;
    this.privateKey = this.signingKey.privateKey;
  }

  /**
   *  Create a new instance of this Wallet connected to provider.
   */
  connect(provider) {
    if (!(abstractProvider.Provider.isProvider(provider))) {
      errors.throwError('invalid provider', errors.INVALID_ARGUMENT, { argument: 'provider', value: provider });
    }
    return new Wallet(this.signingKey, provider);
  }

  getAddress() {
    return Promise.resolve(this.address);
  }

  sign(transaction) {
    return properties.resolveProperties(transaction).then(tx => {
      let rawTx = transaction_1.serialize(tx);
      let signature = this.signingKey.signDigest(keccak256.keccak256(rawTx));
      return transaction_1.serialize(tx, signature);
    });
  }

  signMessage(message) {
    return Promise.resolve(bytes.joinSignature(this.signingKey.signDigest(hash.hashMessage(message))));
  }

  getBalance(blockTag) {
    if (!this.provider) {
      throw new Error('missing provider');
    }
    return this.provider.getBalance(this.address, blockTag);
  }

  getTransactionCount(blockTag) {
    if (!this.provider) {
      throw new Error('missing provider');
    }
    return this.provider.getTransactionCount(this.address, blockTag);
  }

  sendTransaction(transaction) {
    return transaction_1.populateTransaction(transaction, this.provider, this.address)
      .then(tx => this.sign(tx))
      .then(signedTransaction => this.provider.sendTransaction(signedTransaction));
  }

  encrypt(password) {
    return encryptor.encrypt(password, this.privateKey);
  }
}

module.exports = Wallet;

/**
 *  Static methods to create Wallet instances.
 */

Wallet.createRandom = (options) => {
  let entropy = randomBytes.randomBytes(16);
  if (!options) {
    options = {};
  }
  if (options.extraEntropy) {
    entropy = bytes.arrayify(keccak256.keccak256(bytes.concat([entropy, options.extraEntropy])).substring(0, 34));
  }
  let mnemonic = hdnode.entropyToMnemonic(entropy, options.locale);
  return Wallet.fromMnemonic(mnemonic, options.path, options.locale);
};

Wallet.fromEncryptedJson = (json, password) => {
  if (json) {
    return encryptor.decrypt(password, json)
      .then(privateKey => {
        return Promise.resolve(new Wallet(privateKey));
      });
  }
  return Promise.reject('invalid encrypted wallet JSON');
};

Wallet.fromMnemonic = (mnemonic, path, wordlist) => {
  if (!path) {
    path = hdnode.defaultPath;
  }
  return new Wallet(hdnode.fromMnemonic(mnemonic, wordlist).derivePath(path));
};
