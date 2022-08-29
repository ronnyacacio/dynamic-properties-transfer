const axios = require('axios');

const useOracle = (url, token) => {
  return axios.create({
    baseURL: url,
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
      'x-ccasset-language': 'pt-BR',
      Authorization: 'Bearer ' + token,
    },
  });
};

module.exports = useOracle;