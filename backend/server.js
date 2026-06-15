const path = require("path");

// =========================
// LOAD ENV
// =========================
require("dotenv").config({
  path: path.join(__dirname, "..", ".env")
});

// =========================
// CRASH LOGGING
// =========================
process.on("uncaughtException", (err) => {
  console.error("\n========================");
  console.error("UNCAUGHT EXCEPTION");
  console.error("========================");
  console.error(err);
  console.error(err.stack);
});

process.on("unhandledRejection", (reason) => {
  console.error("\n========================");
  console.error("UNHANDLED REJECTION");
  console.error("========================");
  console.error(reason);
});

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// =========================
// REQUEST LOGGER
// =========================
app.use((req, res, next) => {
  console.log(
    `[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`
  );
  next();
});

// =========================
// GROQ SETUP
// =========================
console.log(
  "Groq Key Loaded:",
  !!process.env.GROQ_API_KEY
);

if (!process.env.GROQ_API_KEY) {
  console.error("GROQ_API_KEY not found!");
}

const GROQ_API_URL  = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL    = "llama-3.3-70b-versatile";

// =========================
// PROPERTY DATA
// =========================
const basics = require("./data/property_basics.json");
const chars = require("./data/property_characteristics.json");
const images = require("./data/property_images.json");

const merged = basics.map((property) => {

  const detail = chars.find(
    item => item.id === property.id
  );

  const image = images.find(
    item => item.id === property.id
  );

  return {
    ...property,
    ...(detail || {}),
    ...(image || {})
  };

});

console.log(`Loaded ${merged.length} properties`);

// =========================
// ROOT
// =========================
app.get("/", (req, res) => {

  res.json({
    status: "running",
    properties: merged.length,
    groq: !!process.env.GROQ_API_KEY
  });

});

// =========================
// ALL PROPERTIES
// =========================
app.get("/api/properties", (req, res) => {

  console.log("Returning all properties");

  res.json(merged);

});

// =========================
// SEARCH
// =========================
app.post("/api/search", (req, res) => {

  try {

    console.log("Search Body:", req.body);

    const {
      location,
      budget,
      bedrooms
    } = req.body;

    const result = merged.filter(home => {

      return (
        (!location ||
          home.location?.toLowerCase()
            .includes(location.toLowerCase()))
        &&
        (!budget ||
          Number(home.price) <= Number(budget))
        &&
        (!bedrooms ||
          Number(home.bedrooms) >= Number(bedrooms))
      );

    });

    console.log(
      `Search Results: ${result.length}`
    );

    res.json(result);

  } catch (err) {

    console.error("SEARCH ERROR");
    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

});

// =========================
// COMPARE PROPERTIES
// =========================
app.post("/api/compare", (req, res) => {

  try {

    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length < 2) {
      return res.status(400).json({
        error: "Provide at least 2 property ids to compare."
      });
    }

    if (ids.length > 4) {
      return res.status(400).json({
        error: "You can compare up to 4 properties at a time."
      });
    }

    const numericIds = ids.map(Number);

    const selected = numericIds
      .map(id => merged.find(p => Number(p.id) === id))
      .filter(Boolean);

    if (selected.length !== ids.length) {
      return res.status(404).json({
        error: "One or more properties were not found."
      });
    }

    const prices    = selected.map(p => Number(p.price)      || 0);
    const sizes     = selected.map(p => Number(p.size_sqft)  || 0);
    const beds      = selected.map(p => Number(p.bedrooms)   || 0);
    const baths     = selected.map(p => Number(p.bathrooms)  || 0);
    const amenities = selected.map(p => (p.amenities || []).length);
    const ppsf      = selected.map(p => {
      const price = Number(p.price)     || 0;
      const sqft  = Number(p.size_sqft) || 0;
      return sqft > 0 ? price / sqft : 0;
    });

    const indexOfMin = arr => arr.indexOf(Math.min(...arr.filter(v => v > 0)));
    const indexOfMax = arr => arr.indexOf(Math.max(...arr));

    const highlights = {
      cheapest:       selected[indexOfMin(prices)]?.id     ?? null,
      mostExpensive:  selected[indexOfMax(prices)]?.id     ?? null,
      largest:        selected[indexOfMax(sizes)]?.id      ?? null,
      mostBedrooms:   selected[indexOfMax(beds)]?.id       ?? null,
      mostBathrooms:  selected[indexOfMax(baths)]?.id      ?? null,
      mostAmenities:  selected[indexOfMax(amenities)]?.id  ?? null,
      bestValue:      selected[indexOfMin(ppsf)]?.id       ?? null
    };

    res.json({
      properties: selected,
      highlights
    });

  } catch (err) {

    console.error("COMPARE ERROR");
    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

});

// =========================
// GROQ CHAT
// =========================
app.post("/api/chat", async (req, res) => {

  try {

    console.log("\n========== CHAT ==========");

    const { message } = req.body;

    console.log("User Message:");
    console.log(message);

    if (!message) {
      return res.status(400).json({
        success: false,
        reply: "Message is required."
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        reply: "Groq API key not configured."
      });
    }

    const systemPrompt = `You are Agent Mira, a professional real estate agent and AI assistant.

Guidelines:
- Respond in a professional, polite, and helpful manner.
- Be clear, concise, and friendly.
- Answer the user's question directly and accurately.
- If the user's request is unclear, politely ask for clarification.

Property Database for context:
${JSON.stringify(merged, null, 2)}

Analyze the User Question and return a JSON object with these fields:
- "isSearch" (boolean): true if the user wants to filter properties by criteria (location, budget, bedrooms); false for general questions.
- "location" (string or null): The location the user wants (e.g. "New York", "Austin"), or null.
- "budget" (number or null): Maximum budget (e.g. "$500,000" or "under 500k" → 500000), or null.
- "bedrooms" (number or null): Minimum bedrooms (e.g. "3 bedrooms" or "3+ bed" → 3), or null.
- "reply" (string): A professional answer to the user's query. If isSearch is true, briefly describe their criteria.

Return only the JSON object — no markdown code fences.`;

    console.log("Calling Groq API...");

    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        response_format: { type: "json_object" },
        temperature: 0.4,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: message }
        ]
      })
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.text();
      console.error("Groq API error:", groqRes.status, errBody);
      return res.status(502).json({
        success: false,
        reply: "Groq request failed.",
        error: `${groqRes.status}: ${errBody}`
      });
    }

    const groqJson      = await groqRes.json();
    const responseText  = groqJson.choices?.[0]?.message?.content ?? "";

    console.log("Response Text:", responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Failed to parse Groq response as JSON:", parseErr);
      responseData = {
        isSearch: false,
        location: null,
        budget: null,
        bedrooms: null,
        reply: responseText || "I couldn't parse that — try rephrasing your question."
      };
    }

    res.json({
      success: true,
      ...responseData
    });

  } catch (err) {

    console.error("\n========== GROQ ERROR ==========");
    console.error(err);

    res.status(500).json({
      success: false,
      reply: "Groq request failed.",
      error: err.message
    });

  }

});

// =========================
// START SERVER
// =========================
const PORT = 5000;

app.listen(PORT, () => {

  console.log(
    `🚀 Server running on port ${PORT}`
  );

});