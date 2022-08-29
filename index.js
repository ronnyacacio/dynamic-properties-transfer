require('dotenv/config');

const getToken =  require('./get-token');
const useOracle = require('./hooks/use-oracle');
const itemTypeIds = require('./configs/item-type-ids.json');
const unsupportedProperties = require('./configs/unsupported-properties.json');

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

const getItemType = async itemTypeId => {
  const token = await getToken(hits.origin);
  
  const oracle = useOracle(hits.origin.adminUrl, token);
  const response = await oracle.get(`ccadmin/v1/itemTypes/${itemTypeId}`);
  
  return response.data.specifications;
};

const getItemTypes = async () => {
  return Promise.all(itemTypeIds.map(async itemTypeId => {
    const specifications = await getItemType(itemTypeId);
    const externalSpecifications = specifications.filter(specification => specification.id.includes('x_'));

    if (externalSpecifications.length === 0) return;

    const specificationWithUnsupportedPropertiesRemoved = removeUnsupportedProperties(externalSpecifications);
    
    return {id: itemTypeId, dynamicProperties: specificationWithUnsupportedPropertiesRemoved};
  })).then(itemTypes => itemTypes.filter(itemType => itemType));
};

const removeUnsupportedProperties = specifications => {
  return specifications.map(specification => {
    unsupportedProperties.forEach(unsupportedProperty => {
      delete specification[unsupportedProperty];
    });
    
    return specification;
  });
};

const createDynamicProperty = async (itemTypeId, dynamicProperty) => {

  const token = await getToken(hits.destiny);
  const oracle = useOracle(hits.destiny.adminUrl, token);

  try {
    await oracle.put(`ccadmin/v1/itemTypes/${itemTypeId}`, {specifications: [dynamicProperty]});
    console.log(`✅ Dynamic property '${dynamicProperty.id}' of item type '${itemTypeId}' created successfully!`);
  } catch (err) {
    console.log(`❌ Dynamic property '${dynamicProperty.id}' of item type '${itemTypeId}' already exists!`);
  }
};

const createDynamicProperties = async itemTypes => {
  itemTypes.forEach(itemType => {
    itemType.dynamicProperties.forEach(async dynamicProperty => {
      await createDynamicProperty(itemType.id, dynamicProperty);
    });
  });
};

const transfer = async () => {
  const itemTypes = await getItemTypes();

  await createDynamicProperties(itemTypes);
};

transfer();