import React, { useState } from "react";

const CreateTrip = () => {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");
  const [traveler, setTraveler] = useState("");
  const [planResult, setPlanResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPlanResult(null);

    try {
      const response = await fetch("http://localhost:5000/plan-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          days,
          budget,
          traveler,
        }),
      });

      const data = await response.json();
      // Some Gemini responses return nested text
      const planText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.plan || "No itinerary generated.";
      setPlanResult(planText);
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to fetch itinerary. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 bg-gray-50 min-h-screen">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          ✈️ Plan Your Next Adventure
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destination */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              What is your destination of choice?
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Paris, France"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {/* Days */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              How many days are you planning your trip?
            </label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="e.g. 5"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {/* Budget buttons with highlight */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              What is your budget?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["Cheap", "Moderate", "Luxury"].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setBudget(option)}
                  className={`border rounded-lg p-3 text-sm font-medium transition ${
                    budget === option
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Traveler buttons with highlight */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Who are you traveling with?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["Just Me", "A Couple", "Family", "Friends"].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setTraveler(option)}
                  className={`border rounded-lg p-3 text-sm font-medium transition ${
                    traveler === option
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-3 font-semibold transition ${
              loading
                ? "bg-blue-400 cursor-not-allowed text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "Planning your trip..." : "Generate Itinerary"}
          </button>
        </form>

        {/* Display Result */}
        {planResult && (
          <div className="mt-8 bg-gray-100 p-6 rounded-xl shadow-inner">
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              🗺️ Your AI-Generated Itinerary
            </h3>
            <pre className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
              {planResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTrip;
