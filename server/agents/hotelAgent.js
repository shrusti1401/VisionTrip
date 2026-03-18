import travelKB from "../data/transport.json" with { type: "json" };
import hotelsKB from "../data/hotels.json" with { type: "json" };
/**
 * hotelAgent: fetch hotels in a city with cost calculation
 * @param {string} city - City name
 * @param {number} nights - Number of nights
 * @returns {Array} - array of hotels with totalCost
 */
const hotelAgent = (city, nights = 2) => {
  const cityHotels = hotelsKB[city];
  if (!cityHotels) return [];

  return cityHotels.map((hotel) => ({
    name: hotel.name,
    budget: hotel.budget,         // cheap / moderate / luxury
    distance: hotel.distance,
    costPerNight: hotel.price,    // numeric price from KB
    totalCost: hotel.price * nights,
  }));
};

export default hotelAgent;