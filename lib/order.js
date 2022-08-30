const getToken =  require('../get-token');
const useOracle = require('../hooks/use-oracle');
const {PROPERTY_EXTERNAL_PREFIX} = require('../constants');
const removeUnsupportedProperties = require('../utils/remove-unsupported-properties');

const transferOrderDynamicProperties = async hits => {
  const getOrderTypes = async () => {
    const token = await getToken(hits.origin);
    const oracle = useOracle(hits.origin.adminUrl, token);

    const response = await oracle.get('ccadmin/v1/orderTypes/order');

    const orderTypesFormatted = Object.entries(response.data.properties);
    return orderTypesFormatted.filter(orderType => orderType[0].includes(PROPERTY_EXTERNAL_PREFIX));
  };

  const createOrderType = async orderType => {
    const token = await getToken(hits.destiny);
    const oracle = useOracle(hits.destiny.adminUrl, token);

    const data = {
      properties: {
        [orderType[0]]: removeUnsupportedProperties(orderType[1])
      }
    };

    try {
      await oracle.put('ccadmin/v1/orderTypes/order', data);
      console.log(`✅ Dynamic property '${orderType[0]}' of orderType created successfully!`);
    } catch (err) {
      console.log(`❌ Dynamic property '${orderType[0]}' of orderType already exists!`);
    }
  };

  const orderTypes = await getOrderTypes();

  orderTypes.forEach(async orderType => {
    await createOrderType(orderType);
  });
};

module.exports = {transferOrderDynamicProperties};