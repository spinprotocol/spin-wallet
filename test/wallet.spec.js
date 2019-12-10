const { SpinWallet, WALLET } = require('../index')
const { CONFIG } =require('../config')
const { tap, go, log } = require('ffp-js')
const { privateKey } = require('./mock');

describe('wallet test', () => {
  let createWallet,
      restoreWallet,
      amount = 100

  it('create wallet', async () => {
    createWallet = WALLET.createWallet();
  })

  it('restore wallet ', async () => {
    restoreWallet = WALLET.restoreWalletFromPrivateKey(privateKey)
    restoreWallet.addToken(CONFIG.SPIN_TOKEN_ADDRESS)
    createWallet.addToken(CONFIG.SPIN_TOKEN_ADDRESS)
    // log(wallet.address)
    // log(wallet.privateKey)
    // log(await wallet.klayBalance)
  })

  it('get token balance', () => {
    return go(
      restoreWallet.getTokenBalance(CONFIG.SPIN_TOKEN_ADDRESS),
      // log
    )
  })

  it('sign token', () => {
    return go(
      restoreWallet.signToken(CONFIG.SPIN_TOKEN_ADDRESS, createWallet.address, amount),
      signTx => signTx.rawTransaction,
      log
    )
  })

})
