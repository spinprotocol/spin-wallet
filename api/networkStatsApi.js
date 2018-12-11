const utils = require('ethers').utils;
const get = require('./restApi').get;
const BigNumber = require('ethers').utils.BigNumber;
const _memoize = require('lodash.memoize');

const ETH_GAS_STATION_API_ENDPOINT = 'https://ethgasstation.info/json/ethgasAPI.json';
const DEFAULT_GAS_PRICE = utils.parseUnits('21', 'gwei');   // 21 Gwei
const DEFAULT_PRICE_STATS = {
  safeLow: DEFAULT_GAS_PRICE.div(2).toHexString(),  // 10.5 Gwei
  average: DEFAULT_GAS_PRICE.toHexString(),         // 21 Gwei
  fast: DEFAULT_GAS_PRICE.mul(2).toHexString(),     // 42 Gwei
};


/**
 * Returns always a gas price statistics regardless of error
 */
async function getGasPriceStats() {
  // Default values
  let gasPriceStats;

  try {
    let {safeLow, average, fastest} = await get(ETH_GAS_STATION_API_ENDPOINT);
    gasPriceStats = {
      safeLow: utils.parseUnits(new BigNumber(safeLow).div(10).toString(), 'gwei').toHexString(),
      average: utils.parseUnits(new BigNumber(average).div(10).toString(), 'gwei').toHexString(),
      fast: utils.parseUnits(new BigNumber(fastest).div(10).toString(), 'gwei').toHexString()
    }
    console.log(`Gas price => fast: ${fastest} Gwei - avg: ${average} Gwei`);
  } catch (e) {
    console.log('Gas price => error');
    gasPriceStats = DEFAULT_PRICE_STATS;
  }

  return gasPriceStats;
}

module.exports = {
  // FIXME: Change memoization later. Better use gas price estimastion by considering last n blocks
  getGasPriceStats: _memoize(getGasPriceStats)
};