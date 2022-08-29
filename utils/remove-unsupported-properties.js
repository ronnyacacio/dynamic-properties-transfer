const unsupportedProperties = require('../configs/unsupported-properties.json');

const removeUnsupportedProperties = property => {
    unsupportedProperties.forEach(unsupportedProperty => {
      delete property[unsupportedProperty];
    });
    
    return property;
};

module.exports = removeUnsupportedProperties;