const { merged } = require("./_utils/data");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message } = req.body || {};

  if (!message) {
    return res.status(400).json({ success: false, reply: "Message is required." });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ success: false, reply: "Groq API key not configured." });
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

  try {
    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        response_format: { type: "json_object" },
        temperature: 0.4,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.text();
      return res.status(502).json({
        success: false,
        reply: "Groq request failed.",
        error: `${groqRes.status}: ${errBody}`,
      });
    }

    const groqJson = await groqRes.json();
    const responseText = groqJson.choices?.[0]?.message?.content ?? "";

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = {
        isSearch: false,
        location: null,
        budget: null,
        bedrooms: null,
        reply: responseText || "I couldn't parse that — try rephrasing your question.",
      };
    }

    res.json({ success: true, ...responseData });
  } catch (err) {
    res.status(500).json({
      success: false,
      reply: "Groq request failed.",
      error: err.message,
    });
  }
};
