const getToken =  require('../get-token');
const useOracle = require('../hooks/use-oracle');
const removeUnsupportedProperties = require('../utils/remove-unsupported-properties');

const transferOrderDynamicProperties = async hits => {
  const getOrderTypes = async () => {
    const token = await getToken(hits.origin);
    const oracle = useOracle(hits.origin.adminUrl, token);

    const response = await oracle.get('ccadmin/v1/orderTypes/order');

    const OrderTypesFormatted = Object.entries(response.data.properties);
    return OrderTypesFormatted.filter(OrderType => OrderType[0].includes('x_'));
  };

  const createOrderType = async OrderType => {
    const token = await getToken(hits.destiny);
    const oracle = useOracle(hits.destiny.adminUrl, token);

    const data = {
      properties: {
        [OrderType[0]]: removeUnsupportedProperties(OrderType[1])
      }
    };

    try {
      await oracle.put('ccadmin/v1/OrderTypes/user', data);
      console.log(`✅ Dynamic property '${OrderType[0]}' of orderType created successfully!`);
    } catch (err) {
      console.log(`❌ Dynamic property '${OrderType[0]}' of orderType already exists!`);
    }
  };

  const orderTypes = await getOrderTypes();

  orderTypes.forEach(async orderType => {
    await createOrderType(orderType);
  });
};

module.exports = {transferOrderDynamicProperties};