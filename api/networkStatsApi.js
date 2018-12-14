const utils = require('ethers').utils;
const get = require('./restApi').get;
const BigNumber = require('ethers').utils.BigNumber;
const _memoize = require('lodash.memoize');

const ETH_GAS_STATION_API_ENDPOINT = 'https://ethgasstation.info/json/ethgasAPI.json';

const DEFAULT_GAS_PRICE = utils.parseUnits('21', 'gwei');   // 21 Gwei
const DEFAULT_GAS_PRICE_KLAYTN = utils.parseUnits('25', 'gwei');   // 25 Gwei
const DEFAULT_PRICE_STATS = {
  safeLow: DEFAULT_GAS_PRICE.div(2).toHexString(),  // 10.5 Gwei
  average: DEFAULT_GAS_PRICE.toHexString(),         // 21 Gwei
  fast: DEFAULT_GAS_PRICE.mul(2).toHexString(),     // 42 Gwei
};


/**
 * Returns always a gas price statistics regardless of error
 */
async function getGasPriceStats(network) {
  // If the network is Klaytn, use fixed gas price specific to Klaytn networks
  if (network === 'klaytn' || network === 'aspen') {
    return {
      safeLow: DEFAULT_GAS_PRICE_KLAYTN.toHexString(),  // 25 Gwei
      average: DEFAULT_GAS_PRICE_KLAYTN.toHexString(),  // 25 Gwei
      fast: DEFAULT_GAS_PRICE_KLAYTN.toHexString(),     // 25 Gwei
    };
  }

  try {
    let {safeLow, average, fastest} = await get(ETH_GAS_STATION_API_ENDPOINT);
    console.log(`Gas price => fast: ${fastest / 10} Gwei - avg: ${average / 10} Gwei`);
    return {
      safeLow: utils.parseUnits(new BigNumber(safeLow).div(10).toString(), 'gwei').toHexString(),
      average: utils.parseUnits(new BigNumber(average).div(10).toString(), 'gwei').toHexString(),
      fast: utils.parseUnits(new BigNumber(fastest).div(10).toString(), 'gwei').toHexString()
    }
  } catch (e) {
    console.log('Gas price => error');
    return DEFAULT_PRICE_STATS;
  }
}

module.exports = {
  // FIXME: Change memoization later. Better use gas price estimastion by considering last n blocks
  getGasPriceStats: _memoize(getGasPriceStats)
};