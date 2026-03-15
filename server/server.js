import "dotenv/config";
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const API_KEY = process.env.GOOGLE_API_KEY;
const ORS_KEY = process.env.ORS_API_KEY;

if (!API_KEY) {
  console.error("❌ Set GOOGLE_API_KEY in your .env file");
  process.exit(1);
}

if (!ORS_KEY) {
  console.error("❌ Set ORS_API_KEY in your .env file");
  process.exit(1);
}

// ================= GEMINI INIT =================
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ---------------- HEALTH ----------------
app.get("/", (req, res) => {
  res.send("🚀 Travel Planner Backend running");
});

// ================= DESTINATION INFO =================
app.post("/destination-info", async (req, res) => {
  const { place } = req.body;

  const prompt = `
Give short info about ${place}.
Also provide nearest bus stop, train station and airport.

Respond ONLY in JSON:

{
 "name":"",
 "description":"",
 "bus":"",
 "train":"",
 "airport":""
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const match = text.match(/\{[\s\S]*\}/);

    res.json(JSON.parse(match[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
});

// ================= ITINERARY + HOTELS (SINGLE CALL) =================

function buildPrompt(form) {
  return `
You are a professional travel planner.

Create a complete travel plan.

Destination: ${form.destination}
Days: ${form.days}
Budget: ${form.budget}
Travelers: ${form.travelers}

IMPORTANT:
- Return ONLY valid JSON.
- No markdown.
- No explanations.
- No extra text.
- Hotels must match the budget level.
- Return exactly 5 hotels.

JSON FORMAT:

{
  "destination": "",
  "summary": "",
  "days": [
    {
      "day": 1,
      "title": "",
      "morning": "",
      "afternoon": "",
      "evening": "",
      "tips": ""
    }
  ],
  "estimated_cost": "",
  "transport_suggestions": "",
  "hotels": [
    {
      "name": "",
      "price_range": "",
      "rating": "",
      "description": ""
    }
  ]
}
`;
}

app.post("/plan-trip", async (req, res) => {
  try {
    const result = await model.generateContent(buildPrompt(req.body));
    const text = result.response.text();

    const match = text.match(/\{[\s\S]*\}/);

    if (!match) {
      return res.json({ ok: false, message: "Invalid Gemini response" });
    }

    res.json({
      ok: true,
      itinerary: JSON.parse(match[0]),
    });
  } catch (err) {
    console.error("Plan trip error:", err);
    res.json({ ok: false });
  }
});

// ================= GEMINI TRANSPORT =================
app.post("/gemini-transport", async (req, res) => {
  const { destination, type } = req.body;

  const prompt = `
Nearest ${type} to ${destination}

Return JSON ONLY:

{
 "name":"",
 "lat":0,
 "lng":0
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const match = text.match(/\{[\s\S]*\}/);

    res.json({ ok: true, place: JSON.parse(match[0]) });
  } catch (err) {
    console.error(err);
    res.json({ ok: false });
  }
});

// ================= DISTANCE =================
app.post("/distance", async (req, res) => {
  const { from, to } = req.body;

  try {
    const response = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      {
        method: "POST",
        headers: {
          Authorization: ORS_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: [
            [from.lng, from.lat],
            [to.lng, to.lat],
          ],
        }),
      }
    );

    const data = await response.json();
    const summary = data.routes[0].summary;

    res.json({
      ok: true,
      distance_km: (summary.distance / 1000).toFixed(2),
      duration_min: Math.round(summary.duration / 60),
    });
  } catch (err) {
    console.error(err);
    res.json({ ok: false });
  }
});

// ================= START =================
app.listen(PORT, () =>
  console.log(`✅ Server running http://localhost:${PORT}`)
);
