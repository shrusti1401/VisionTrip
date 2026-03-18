// monumentAgent.js

import monumentsRaw from "../data/monuments.json" with { type: "json" };

// Helper: normalize strings
const normalize = (str) =>
  str.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");

// Normalize monument keys
const monuments = {};

for (const key in monumentsRaw) {
  monuments[normalize(key)] = monumentsRaw[key];
}

// Monument agent
const monumentAgent = (monumentName) => {
  if (!monumentName) return null;

  const normalizedName = normalize(monumentName);

  return monuments[normalizedName] || null;
};

export default monumentAgent;