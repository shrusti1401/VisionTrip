import "dotenv/config";
import express from "express";
import cors from "cors";
import monumentAgent from "./agents/monumentAgent.js";
import hotelsData from "./data/hotels.json" with { type: "json" };

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------------- Middleware ---------------- */

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

/* ---------------- Health Check ---------------- */

app.get("/", (req, res) => {
  res.json({
    status: "running",
    message: "Travel Planner Backend running"
  });
});

/* ---------------- Destination Info ---------------- */

app.post("/destination-info", (req, res) => {

  const { place } = req.body;

  if (!place) {
    return res.json({
      ok: false,
      message: "Place required"
    });
  }

  res.json({
    ok: true,
    data: {
      name: place,
      description: `${place} is a popular tourist destination known for its history, culture, and attractions.`,
      bus: `${place} Bus Station`,
      train: `${place} Railway Station`,
      airport: `${place} Airport`
    }
  });

});

/* ---------------- AI Agent Booking ---------------- */

app.post("/api/agent/agent-book", (req, res) => {

  try {

    const {
      monument,
      departureCity,
      budget,
      startDate,
      endDate,
      transportMode
    } = req.body;

    console.log("Incoming booking request:", req.body);
  
    const monumentInfo = monumentAgent(monument);

if (!monumentInfo) {
  return res.status(400).json({ error: "Monument not found" });
}

const destinationCity = monumentInfo.city;

console.log("Detected destination city:", destinationCity);

    //yaha se
    const monumentHotels = hotelsData[monument];

    if (!monumentHotels) {
      return res.status(400).json({ error: "No hotels found for this monument" });
    }
    //yaha tak

    /* ---- Calculate nights safely ---- */

    let nights = 1;

    if (startDate && endDate) {

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start) && !isNaN(end)) {

        const diff = end.getTime() - start.getTime();

        nights = Math.max(
          1,
          Math.ceil(diff / (1000 * 60 * 60 * 24))
        );
      }
    }

    /* ---- Basic recommendation logic ---- */

    const city = monument || "Unknown";

    const transport = transportMode || "Train";

    const hotel = "Recommended Hotel";

    const totalCost = budget ? Number(budget) : 5000;

    const withinBudget =
      budget && totalCost > Number(budget)
        ? { status: "exceeded" }
        : { status: "ok" };

    /* ---- Send booking response ---- */

    res.json({
      city: destinationCity,
      transport,
      hotel,
      nights,
      totalCost,
      withinBudget,
      links: {
        transport: `https://www.google.com/maps/search/flights+to+${encodeURIComponent(city)}`,
        hotel: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}`
      }
    });

  } catch (err) {

    console.error("Agent booking error:", err);

    res.status(500).json({
      error: "Booking failed"
    });

  }

});

/* ---------------- Dummy Transport API ---------------- */

app.post("/gemini-transport", (req, res) => {

  const { destination } = req.body;

  const placeName = destination || "Location";

  res.json({
    ok: true,
    place: {
      name: `${placeName} Center`,
      lat: 28.6139,
      lng: 77.2090
    }
  });

});

/* ---------------- Dummy Distance API ---------------- */

app.post("/distance", (req, res) => {

  res.json({
    ok: true,
    distance_km: 5,
    duration_min: 12
  });

});

/* ---------------- Start Server ---------------- */

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});