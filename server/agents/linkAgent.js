// linkAgent.js

import monumentAgent from "./monumentAgent.js";

const linkAgent = (monumentName) => {
  if (!monumentName) return null;

  const monument = monumentAgent(monumentName);

  if (!monument) {
    return {
      error: "Monument not found"
    };
  }

  const city = monument.city || monumentName;

  return {
    google_maps: `https://www.irctc.co.in/nget/train-search`,
    hotels: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}`,
    attractions: `https://www.tripadvisor.com/Search?q=${encodeURIComponent(city)}`
  };
};

export default linkAgent;