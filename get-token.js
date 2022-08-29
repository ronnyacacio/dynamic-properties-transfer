const queryString = require('query-string');
const useOracle = require('./hooks/use-oracle');

const getToken = async access => {
  const oracle = useOracle(access.storeUrl, access.appKey);

  const response = await oracle.post('ccapp/v1/login', queryString.stringify({grant_type:'client_credentials'}), {
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data.access_token;
};

module.exports = getToken;