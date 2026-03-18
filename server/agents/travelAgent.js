const transport = require("../data/transport.json");

function calculateTravel(departureCity, destinationCity, mode) {

  const cityData = transport[destinationCity];

  if (!cityData) {
    return { error: "Destination not found in transport KB" };
  }

  const travelData = cityData[mode];

  const oneWayCost = travelData.price;
  const totalCost = oneWayCost * 2;

  return {
    departureCity,
    destinationCity,
    mode,
    oneWayCost,
    totalCost,
    duration: travelData.duration
  };
}

module.exports = { calculateTravel };