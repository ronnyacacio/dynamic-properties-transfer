require('dotenv/config');

const {transferItemDynamicProperties} = require('./lib/item');
const {transferOrderDynamicProperties} = require('./lib/order');
const {transferShopperDynamicProperties} = require('./lib/shopper');

const hits = {
  origin: {
    adminUrl: process.env.ADMIN_ORIGIN_URL,
    storeUrl: process.env.STORE_ORIGIN_URL,
    appKey: process.env.ENVIRONMENT_ORIGIN_APPKEY
  },
  destiny: {
    adminUrl: process.env.ADMIN_DESTINY_URL,
    storeUrl: process.env.STORE_DESTINY_URL,
    appKey: process.env.ENVIRONMENT_DESTINY_APPKEY
  }
};

const transfer = async () => {
  await transferItemDynamicProperties(hits);

  await transferOrderDynamicProperties(hits);

  await transferShopperDynamicProperties(hits);
};

transfer();