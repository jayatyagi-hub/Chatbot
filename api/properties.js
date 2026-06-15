const { merged } = require("./_utils/data");

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json(merged);
};
