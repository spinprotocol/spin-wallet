const utils = require('ethers').utils;
const get = require('./restApi').get;

const ETH_GAS_STATION_API_ENDPOINT = 'https://ethgasstation.info/json/ethgasAPI.json';
const DEFAULT_GAS_PRICE = utils.parseUnits(10, 'gwei');   // 10 Gwei


/**
 * Returns always a gas price statistics regardless of error
 */
export async function getGasPriceStats() {
  // Default values
  let gasPriceStats = {
    safeLow: DEFAULT_GAS_PRICE.div(2).toHexString(),  // 5 Gwei
    average: DEFAULT_GAS_PRICE.toHexString(),         // 10 Gwei
    fast: DEFAULT_GAS_PRICE.mul(2).toHexString(),     // 20 Gwei
  };

  try {
    let res = await get(ETH_GAS_STATION_API_ENDPOINT);
    gasPriceStats = {
      safeLow: utils.parseUnits(res.safeLow / 10, 'gwei').toHexString(),
      average: utils.parseUnits(res.average / 10, 'gwei').toHexString(),
      fast: utils.parseUnits(res.fastest / 10, 'gwei').toHexString()
    }
    console.log(`Gas price => fast: ${gasPriceStats.fast} avg: ${gasPriceStats.average}`);
  } catch (e) {
    console.log(`Gas price => Error:`, e);
  }

  return gasPriceStats;
}