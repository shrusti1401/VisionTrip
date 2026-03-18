import monumentAgent from "../agents/monumentAgent.js";
import hotelAgent from "../agents/hotelAgent.js";
import linkAgent from "../agents/linkAgent.js";
import travelKB from "../data/transport.json" with { type: "json" }; // your travel knowledge base

const normalize = (str) =>
  str.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");

const runAgent = (req, res) => {
  const { monument, departureCity, budget, startDate, endDate, transportMode } = req.body;

const transport = transportMode; // normalize field name

  if (!monument) return res.json({ error: "Please provide a monument name" });
  if (!departureCity) return res.json({ error: "Please provide a departure city" });
  if (!budget) return res.json({ error: "Please provide your budget" });
  if (!transport) return res.json({ error: "Please select transport mode" });

  const context = monumentAgent(normalize(monument));
  if (!context) return res.json({ error: "Monument not found in knowledge base", monument });

  // calculate nights
  const nights =
    startDate && endDate
      ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
      : 2;

  const destCity = context.city;

  // get travel cost from KB
  const travelData = travelKB[departureCity]?.[destCity];
  if (!travelData || !travelData[transport]) {
    return res.json({ error: `No ${transport} available from ${departureCity} to ${destCity}` });
  }

  const travelCost = travelData[transport].price;

  // remaining budget for hotel
  const remainingBudget = budget - travelCost;
  if (remainingBudget <= 0)
    return res.json({ error: "Budget too low for selected transport", monument });

  // get hotels from KB
  const hotels = hotelAgent(destCity, nights); // [{name, costPerNight}]
  const affordableHotels = hotels.filter(h => h.costPerNight * nights <= remainingBudget);

  if (!affordableHotels.length)
    return res.json({ error: "No hotels available within remaining budget", monument });

  // pick the cheapest hotel within budget
  const selectedHotel = affordableHotels.reduce((prev, curr) =>
    prev.costPerNight < curr.costPerNight ? prev : curr
  );

  const totalCost = travelCost + selectedHotel.costPerNight * nights;

  // generate booking links
  const links = linkAgent(
    transport,
    departureCity,
    destCity,
    startDate,
    endDate,
    selectedHotel.name
  );

  res.json({
    monument,
    city: destCity,
    departureCity,
    transport,
    hotel: selectedHotel.name,
    nights,
    totalCost,
    links,
  });
};

export default runAgent;