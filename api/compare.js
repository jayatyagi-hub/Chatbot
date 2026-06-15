const { merged } = require("./_utils/data");

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { ids } = req.body || {};

  if (!Array.isArray(ids) || ids.length < 2) {
    return res.status(400).json({ error: "Provide at least 2 property ids to compare." });
  }
  if (ids.length > 4) {
    return res.status(400).json({ error: "You can compare up to 4 properties at a time." });
  }

  const numericIds = ids.map(Number);
  const selected = numericIds.map((id) => merged.find((p) => Number(p.id) === id)).filter(Boolean);

  if (selected.length !== ids.length) {
    return res.status(404).json({ error: "One or more properties were not found." });
  }

  const prices = selected.map((p) => Number(p.price) || 0);
  const sizes = selected.map((p) => Number(p.size_sqft) || 0);
  const beds = selected.map((p) => Number(p.bedrooms) || 0);
  const baths = selected.map((p) => Number(p.bathrooms) || 0);
  const amenities = selected.map((p) => (p.amenities || []).length);
  const ppsf = selected.map((p) => {
    const price = Number(p.price) || 0;
    const sqft = Number(p.size_sqft) || 0;
    return sqft > 0 ? price / sqft : 0;
  });

  const indexOfMin = (arr) => arr.indexOf(Math.min(...arr.filter((v) => v > 0)));
  const indexOfMax = (arr) => arr.indexOf(Math.max(...arr));

  const highlights = {
    cheapest: selected[indexOfMin(prices)]?.id ?? null,
    mostExpensive: selected[indexOfMax(prices)]?.id ?? null,
    largest: selected[indexOfMax(sizes)]?.id ?? null,
    mostBedrooms: selected[indexOfMax(beds)]?.id ?? null,
    mostBathrooms: selected[indexOfMax(baths)]?.id ?? null,
    mostAmenities: selected[indexOfMax(amenities)]?.id ?? null,
    bestValue: selected[indexOfMin(ppsf)]?.id ?? null,
  };

  res.json({ properties: selected, highlights });
};
