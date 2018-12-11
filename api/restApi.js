const axios = require('axios');


async function get(url, headers) {
  try {
    let res = await axios.get(url, {headers});
    return Promise.resolve(res.data);
  } catch (e) {
    return Promise.reject(new Error(e.response.data));
  }
}

async function post(url, data, headers) {
  try {
    let res = await axios.post(url, data, {headers});
    return Promise.resolve(res.data);
  } catch (e) {
    return Promise.reject(new Error(e.response.data));
  }
}

module.exports = {
  get,
  post
};