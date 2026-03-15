import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  MapPinIcon,
  CalendarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const budgetOptions = [
  { name: "Cheap", icon: "💵", description: "Stay conscious of costs" },
  { name: "Moderate", icon: "💰", description: "Keep cost on the average side" },
  { name: "Luxury", icon: "🥂", description: "Don't worry about cost" },
];

const travelerOptions = [
  { name: "Just Me", icon: "✈️", description: "A sole traveler in exploration" },
  { name: "A Couple", icon: "🥂", description: "Two travelers in tandem" },
  { name: "Family", icon: "🏡", description: "Fun and memorable family time" },
  { name: "Friends", icon: "👯", description: "Shared adventures and memories" },
];

const CreateTrip = () => {
  const location = useLocation();

  const [destination, setDestination] = useState(
    location.state?.destination || ""
  );
  const [days, setDays] = useState("3");
  const [budget, setBudget] = useState("Cheap");
  const [traveler, setTraveler] = useState("");
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.destination) {
      setDestination(location.state.destination);
    }
  }, [location.state]);

  const getDayOptions = () =>
    Array.from({ length: 14 }, (_, i) => i + 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setItinerary(null);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/plan-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          days: Number(days),
          budget,
          travelers: traveler,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        setItinerary(data.itinerary);
      } else {
        setError(data.message || "Failed to generate itinerary");
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting to the trip planning server.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-black text-white px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-14">

        {/* Title */}
        <h2 className="text-5xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          ✨ Plan Your Perfect Trip
        </h2>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* Destination */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-3 text-lg font-semibold">
              <MapPinIcon className="w-6 h-6 text-blue-400" />
              What is your destination of choice?
            </div>

            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter destination"
              className="mt-4 w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* Days */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-3 text-lg font-semibold">
              <CalendarIcon className="w-6 h-6 text-blue-400" />
              How many days are you planning your trip?
            </div>

            <select
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="mt-4 w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-400 outline-none"
            >
              {getDayOptions().map((day) => (
                <option key={day} value={day} className="text-black">
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <h3 className="text-lg font-semibold mb-6">💳 What is Your Budget?</h3>

            <div className="grid md:grid-cols-3 gap-6">
              {budgetOptions.map((option) => (
                <button
                  key={option.name}
                  type="button"
                  onClick={() => setBudget(option.name)}
                  className={`rounded-2xl p-6 text-left transition-all ${
                    budget === option.name
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="text-3xl">{option.icon}</div>
                  <div className="font-bold mt-2">{option.name}</div>
                  <div className="text-sm opacity-70 mt-1">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Traveler */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <h3 className="text-lg font-semibold mb-6">
              👥 Who do you plan on traveling with?
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {travelerOptions.map((option) => (
                <button
                  key={option.name}
                  type="button"
                  onClick={() => setTraveler(option.name)}
                  className={`rounded-2xl p-6 text-left transition-all ${
                    traveler === option.name
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="text-3xl">{option.icon}</div>
                  <div className="font-bold mt-2">{option.name}</div>
                  <div className="text-sm opacity-70 mt-1">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !destination || !traveler}
            className="w-full py-5 rounded-2xl font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-[1.02] transition disabled:opacity-40 flex items-center justify-center gap-3"
          >
            {loading ? "Planning your trip..." : "Generate Itinerary"}
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-xl">
            ⚠️ {error}
          </div>
        )}

        {/* Itinerary */}
        {itinerary && (
          <div className="space-y-8 mt-12">
            <h3 className="text-3xl font-bold text-blue-400">
              🗺️ Your Generated Itinerary
            </h3>

            {itinerary.days?.map((day) => (
              <div
                key={day.day}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <h4 className="text-2xl font-bold text-purple-400 mb-4">
                  Day {day.day}: {day.title}
                </h4>

                <p className="opacity-80">🌅 {day.morning}</p>
                <p className="opacity-80">🏙️ {day.afternoon}</p>
                <p className="opacity-80">🌙 {day.evening}</p>

                {day.tips && (
                  <div className="mt-4 text-sm bg-white/5 p-3 rounded-lg opacity-70">
                    💡 {day.tips}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTrip;