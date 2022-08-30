const getToken =  require('../get-token');
const useOracle = require('../hooks/use-oracle');
const {PROPERTY_EXTERNAL_PREFIX} = require('../constants');
const removeUnsupportedProperties = require('../utils/remove-unsupported-properties');

const transferShopperDynamicProperties = async hits => {
  const getShopperTypes = async () => {
    const token = await getToken(hits.origin);
    const oracle = useOracle(hits.origin.adminUrl, token);

    const response = await oracle.get('ccadmin/v1/shopperTypes/user');

    const shopperTypesFormatted = Object.entries(response.data.properties);
    return shopperTypesFormatted.filter(shopperType => shopperType[0].includes(PROPERTY_EXTERNAL_PREFIX));
  };

  const createShopperType = async shopperType => {
    const token = await getToken(hits.destiny);
    const oracle = useOracle(hits.destiny.adminUrl, token);

    const data = {
      properties: {
        [shopperType[0]]: removeUnsupportedProperties(shopperType[1])
      }
    };

    try {
      await oracle.put('ccadmin/v1/shopperTypes/user', data);
      console.log(`✅ Dynamic property '${shopperType[0]}' of shopperType created successfully!`);
    } catch (err) {
      console.log(`❌ Dynamic property '${shopperType[0]}' of shopperType already exists!`);
    }
  };

  const shopperTypes = await getShopperTypes();

  shopperTypes.forEach(async shopperType => {
    await createShopperType(shopperType);
  });
};

module.exports = {transferShopperDynamicProperties};