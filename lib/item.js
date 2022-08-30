const getToken =  require('../get-token');
const useOracle = require('../hooks/use-oracle');
const {PROPERTY_EXTERNAL_PREFIX} = require('../constants');
const removeUnsupportedProperties = require('../utils/remove-unsupported-properties');
const itemTypeIds = require('../configs/item-type-ids.json');

const transferItemDynamicProperties = async hits => {

  const getItemType = async itemTypeId => {
    const token = await getToken(hits.origin);
    
    const oracle = useOracle(hits.origin.adminUrl, token);
    const response = await oracle.get(`ccadmin/v1/itemTypes/${itemTypeId}`);
    
    return response.data.specifications;
  };
  
  const getItemTypes = async () => {
    return Promise.all(itemTypeIds.map(async itemTypeId => {
      const specifications = await getItemType(itemTypeId);
      const externalSpecifications = specifications.filter(specification => specification.id.includes(PROPERTY_EXTERNAL_PREFIX));
  
      if (externalSpecifications.length === 0) return;
  
      const specificationWithUnsupportedPropertiesRemoved = externalSpecifications.map(externalSpecification => removeUnsupportedProperties(externalSpecification));
      
      return {id: itemTypeId, dynamicProperties: specificationWithUnsupportedPropertiesRemoved};
    })).then(response => response.filter(itemType => itemType));
  };
  
  const createItemDynamicProperty = async (itemTypeId, dynamicProperty) => {
    const token = await getToken(hits.destiny);
    const oracle = useOracle(hits.destiny.adminUrl, token);
  
    try {
      await oracle.put(`ccadmin/v1/itemTypes/${itemTypeId}`, {specifications: [dynamicProperty]});
      console.log(`✅ Dynamic property '${dynamicProperty.id}' of itemType '${itemTypeId}' created successfully!`);
    } catch (err) {
      console.log(`❌ Dynamic property '${dynamicProperty.id}' of itemType '${itemTypeId}' already exists!`);
    }
  };
  
  const itemTypes = await getItemTypes();
  
  itemTypes.forEach(itemType => {
    itemType.dynamicProperties.forEach(async dynamicProperty => {
      await createItemDynamicProperty(itemType.id, dynamicProperty);
    });
  });
};

module.exports = {transferItemDynamicProperties};