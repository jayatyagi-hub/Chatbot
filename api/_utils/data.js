const basics = require("../data/property_basics.json");
const chars = require("../data/property_characteristics.json");
const images = require("../data/property_images.json");

const merged = basics.map((property) => {
  const detail = chars.find((item) => item.id === property.id);
  const image = images.find((item) => item.id === property.id);
  return { ...property, ...(detail || {}), ...(image || {}) };
});

module.exports = { merged };
