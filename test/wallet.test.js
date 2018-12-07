const Utils = require('ethers').utils;
const SpinWallet = require('./mockWallet');
require('chai')
  .use(require('chai-bignumber')(Utils.BigNumber))
  .use(require('chai-as-promised'))
  .should();

const expect = require('chai')
  .use(require('chai-bignumber')(Utils.BigNumber))
  .use(require('chai-as-promised'))
  .expect;


const password = '_test_';
const passwordAlt = '_test_1_';
const testMessage = 'This is a test message';
const testTx = {
  nonce: 666,
  gasLimit: 21000,
  gasPrice: Utils.bigNumberify('20000000000'),
  to: '0x88a5C2d9919e46F883EB62F7b8Dd9d0CC45bc290',
  value: Utils.parseEther('1.0'),
  data: '0x',
  chainId: Utils.getNetwork('rinkeby').chainId
};
const fakeToken = {
  symbol: 'FAKE',
  address: '0x90ec42f41c452DC76169223fC7D8304a2D3e5FAa',
  decimals: 6
}

describe('SpinWalletApi', () => {
  let myWallet;

  beforeEach(() => {
    myWallet = SpinWallet.createWallet();
  });

  it('can create a new wallet', () => {
    let newWallet = SpinWallet.createWallet();
    let primaryAddress = newWallet.getAddress();
    // Check if the address is a valid Ethereum address
    Utils.getAddress(primaryAddress);
  });

  it('can restore the wallet from its private key', () => {
    let privateKey = myWallet.getPrivateKey();
    let primaryAddress = myWallet.getAddress();

    let restoredWallet = SpinWallet.restoreWalletFromPrivateKey(privateKey);

    restoredWallet.getAddress().should.be.equal(primaryAddress);
    restoredWallet.getPrivateKey().should.be.equal(privateKey);
  });

  it('can restore the wallet from its mnemonics', () => {
    let mnemonics = myWallet.getMnemonics();
    let privateKey = myWallet.getPrivateKey();
    let primaryAddress = myWallet.getAddress();

    let restoredWallet = SpinWallet.restoreWalletFromMnemonics(mnemonics);

    restoredWallet.getAddress().should.be.equal(primaryAddress);
    restoredWallet.getPrivateKey().should.be.equal(privateKey);
  });

  it('can connect to a network', () => {
    myWallet.connect('rinkeby');
    myWallet.provider.should.not.be.undefined;
    myWallet.provider.should.not.be.null;
  });

  it('can lock and unlock the wallet', async () => {
    let mnemonics = myWallet.getMnemonics();
    let privateKey = myWallet.getPrivateKey();

    await myWallet.lock(password).should.be.fulfilled;

    myWallet.isLocked.should.be.true;
    expect(myWallet.getMnemonics).to.throw();
    expect(myWallet.getPrivateKey).to.throw();
    
    await myWallet.unlock(password).should.be.fulfilled;

    myWallet.isLocked.should.be.false;
    myWallet.getMnemonics().should.be.equal(mnemonics);
    myWallet.getPrivateKey().should.be.equal(privateKey);
  });

  it('does not allow to do any operation when it is locked', async () => {
    await myWallet.lock(password).should.be.fulfilled;

    expect(myWallet.connect.bind(myWallet.connect, 'rinkeby')).to.throw();
    await myWallet.getEtherBalance().should.be.rejected;
    await myWallet.getTokenBalance().should.be.rejected;
    expect(myWallet.addToken).to.throw();
    expect(myWallet.removeToken).to.throw();
    await myWallet.sendEther().should.be.rejected;
    await myWallet.sendToken().should.be.rejected;
    await myWallet.sign(testTx).should.be.rejected;
    await myWallet.signMessage(testMessage).should.be.rejected;
  });

  it('can sign a transaction', async () => {
    let signature = await myWallet.sign(testTx).should.be.fulfilled;
    let tx = Utils.parseTransaction(signature);
    tx.from.should.be.equal(myWallet.getAddress());
  });

  it('can sign a message', async () => {
    let signature = await myWallet.signMessage(testMessage).should.be.fulfilled;
    Utils.verifyMessage(testMessage, signature).should.be.equal(myWallet.getAddress());
  });

  it('can add/remove an ERC20 token', async () => {
    myWallet.connect('rinkeby');
    myWallet.addToken(fakeToken.symbol, fakeToken.address, fakeToken.decimals);
    myWallet.removeToken(fakeToken.address);
  });

  it('does not allow to unlock the wallet with a wrong password', async () => {
    await myWallet.lock(password).should.be.fulfilled;

    myWallet.isLocked.should.be.true;
    expect(myWallet.getMnemonics).to.throw();
    expect(myWallet.getPrivateKey).to.throw();
    
    await myWallet.unlock(passwordAlt).should.be.rejected;
  });

  it('can save and retrieve the locked wallet to/from the storage', async () => {
    let encryptedWallet = await myWallet.lock(password).should.be.fulfilled;
    await SpinWallet.saveVault(encryptedWallet).should.be.fulfilled;

    let retrievedWallet = await SpinWallet.retrieveVault().should.be.fulfilled;

    retrievedWallet.should.be.equal(encryptedWallet);
  });

  it('can retreive and unlock a wallet saved in vault', async () => {
    let mnemonics = myWallet.getMnemonics();
    let privateKey = myWallet.getPrivateKey();
    let encryptedWallet = await myWallet.lock(password).should.be.fulfilled;
    await SpinWallet.saveVault(encryptedWallet).should.be.fulfilled;

    let vault = await SpinWallet.retrieveVault().should.be.fulfilled;
    let wallet = await SpinWallet.restoreWalletFromVault(vault, password).should.be.fulfilled;

    wallet.isLocked.should.be.false;
    wallet.getMnemonics().should.be.equal(mnemonics);
    wallet.getPrivateKey().should.be.equal(privateKey);
  });
});

// let wallet = SpinWallet.restoreWalletFromMnemonics('timber carbon better crop motion thumb remind any reject hungry giggle shift');

// wallet.connect('rinkeby');
// wallet.sendToken('0x668D6D1a5be72dC477C630DE38aaEDc895e5019C', '0xb38951160Db9FF7A33e3e901Fa53569B13525946', 5000)
//   .then(tx => console.log('Token Tx: ', tx))
//   .catch(console.log);

// wallet.lock('test1')
//   .then(jsonWallet => {
//     console.log('Encrypted wallet:', jsonWallet)
//     return SpinWallet.saveVault(jsonWallet)
//   })
//   .then(res => console.log('Wallet saved,', wallet))
//   .catch(console.log)

// SpinWallet.retrieveVault()
//   .then(jsonWallet => {
//     return SpinWallet.restoreWalletFromVault(jsonWallet, 'test')
//   })
//   .then(wallet => {
//     console.log('Wallet unlocked,', wallet)

//     wallet.connect('rinkeby');
//     wallet.sendEther('0xb38951160Db9FF7A33e3e901Fa53569B13525946', '0.2')
//       .then(tx => console.log('Ether Tx: ', tx))
//       .catch(console.log);
//   })
//   .catch(console.log)