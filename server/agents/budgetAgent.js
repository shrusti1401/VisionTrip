const budgetAgent = (userBudget, travelOptions, hotelOptions) => {
  let chosenTransport = null;
  let chosenHotel = null;
  let totalCost = Infinity;

  for (let hotel of hotelOptions) {
    const hotelCost = hotel.costPerNight * hotel.nights;

    for (let transport of travelOptions) {
      const cost = transport.cost + hotelCost;

      if (cost <= userBudget && cost < totalCost) {
        totalCost = cost;
        chosenTransport = transport.mode; // "train" or "flight"
        chosenHotel = hotel;
      }
    }
  }

  if (!chosenHotel || !chosenTransport) {
    return { status: "adjust", message: "Budget too low for available options" };
  }

  return {
    status: "ok",
    transport: chosenTransport,
    hotel: chosenHotel.name,
    nights: chosenHotel.nights,
    totalCost,           // numeric total cost
  };
};

export default budgetAgent;