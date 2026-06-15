const { merged } = require("./_utils/data");

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { location, budget, bedrooms } = req.body || {};

  const result = merged.filter((home) => {
    return (
      (!location || home.location?.toLowerCase().includes(location.toLowerCase())) &&
      (!budget || Number(home.price) <= Number(budget)) &&
      (!bedrooms || Number(home.bedrooms) >= Number(bedrooms))
    );
  });

  res.json(result);
};
