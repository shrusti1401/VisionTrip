import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Chatbot from "../components/Chatbot";

const BACKEND_URL = "http://localhost:5000";

/* ================= AI AGENT MODAL ================= */

function AgentBookingModal({ defaultMonument, onClose }) {
  const [form, setForm] = useState({
    monument: defaultMonument || "",
    departureCity: "",
    budget: "",
    startDate: "",
    endDate: "",
    transportMode: ""
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const cleanMonumentName = (name) => {
    if (!name) return "";
    return name.split(",")[0].trim();
  };

  const handleSubmit = async () => {

    /* ---------- NEW FIX: TRANSPORT VALIDATION ---------- */
    if (!form.transportMode) {
      setError("Please select transport mode");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {

      const res = await fetch(`${BACKEND_URL}/api/agent/agent-book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          monument: cleanMonumentName(form.monument),
          departureCity: form.departureCity,
          budget: form.budget,
          startDate: form.startDate,
          endDate: form.endDate,
          transportMode: form.transportMode
        })
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Invalid JSON from server:", text);
        setError("Invalid response from server");
        setLoading(false);
        return;
      }

      console.log("Agent result:", data);
      
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setResult(data);

    } catch (err) {

      console.error("Fetch error:", err);
      setError("Server error. Try again.");

    }

    setLoading(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-white rounded-2xl p-8 max-w-lg w-full text-black"
        >

          <h2 className="text-2xl font-bold mb-4">
            📅 Book with AI Agent
          </h2>

          {!result ? (
            <>
              <input
                type="text"
                name="monument"
                placeholder="Monument"
                value={form.monument}
                onChange={handleChange}
                className="w-full mb-3 px-4 py-2 border rounded-lg"
              />

              <input
                type="text"
                name="departureCity"
                placeholder="Departure City"
                value={form.departureCity}
                onChange={handleChange}
                className="w-full mb-3 px-4 py-2 border rounded-lg"
              />

              <input
                type="number"
                name="budget"
                placeholder="Budget (₹)"
                value={form.budget}
                onChange={handleChange}
                className="w-full mb-3 px-4 py-2 border rounded-lg"
              />

              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full mb-3 px-4 py-2 border rounded-lg"
              />

              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full mb-3 px-4 py-2 border rounded-lg"
              />

              {/* Transport Mode */}
              <select
                name="transportMode"
                value={form.transportMode}
                onChange={handleChange}
                className="w-full mb-3 px-4 py-2 border rounded-lg"
              >
                <option value="">Select Transport Mode</option>
                <option value="train">Train</option>
                <option value="bus">Bus</option>
                <option value="flight">Flight</option>
              </select>

              {error && (
                <p className="text-red-500 mb-3">
                  {error}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-500 transition"
              >
                {loading ? "Booking..." : "Book Now"}
              </button>
            </>
          ) : (

            <div>

              <h3 className="font-semibold text-lg mb-2">
                Booking Details
              </h3>

              <p>City: {result?.city}</p>

              <p>Transport: {result?.transport}</p>

              <p>
                Hotel: {result?.hotel} ({result?.nights} nights)
              </p>

              <p>Total Cost: ₹{result?.totalCost}</p>

              <p>
                Within Budget:{" "}
                {result?.withinBudget?.status === "ok"
                  ? "✔ Yes"
                  : "❌ No"}
              </p>

              {result?.links?.transport && (
                <a
                  href={result.links.transport}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Book Transport
                </a>
              )}

              {result?.links?.hotel && (
                <a
                  href={result.links.hotel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 bg-green-500 text-white px-4 py-2 rounded-lg ml-3"
                >
                  Book Hotel
                </a>
              )}

              <button
                onClick={onClose}
                className="mt-4 text-sm text-gray-600 hover:underline"
              >
                Close
              </button>

            </div>

          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ================= MAIN COMPONENT ================= */

export default function DestinationDetails() {

  const location = useLocation();
  const navigate = useNavigate();

  const [showAgentForm, setShowAgentForm] = useState(false);

  const destination =
    location.state?.destination ||
    new URLSearchParams(location.search).get("destination");

  const [coords, setCoords] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [about, setAbout] = useState(null);
  const [error, setError] = useState("");

  const mapCoords = selectedPlace || coords;

  const cleanMonumentName = (name) =>
    name?.split(",")[0]?.trim() || "";

  /* ================= DESTINATION INFO ================= */

  useEffect(() => {

    if (!destination) return;
    setSelectedPlace(null);
    const fetchAbout = async () => {

      try {

        const res = await fetch(`${BACKEND_URL}/destination-info`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            place: cleanMonumentName(destination)
          })
        });

        const data = await res.json();

        console.log("Destination info:", data);

        if (data.ok) {
          setAbout(data.data.description);
        } else {
          setError(data.message);
        }

      } catch (err) {

        console.error("About fetch error:", err);

        setError(
          "Backend not reachable. Make sure server is running."
        );

      }
    };

    fetchAbout();

  }, [destination]);

  /* ================= FETCH CITY CENTER ================= */

  useEffect(() => {

    if (!destination) return;

    const fetchCoords = async () => {

      try {

        const res = await fetch(`${BACKEND_URL}/gemini-transport`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            destination,
            type: "city center"
          })
        });

        const data = await res.json();

        if (data.ok) setCoords(data.place);

      } catch (err) {

        console.error("Coords error:", err);

      }
    };

    fetchCoords();

  }, [destination]);

  /* ================= FETCH TRANSPORT ================= */

  const fetchGeminiPlace = async (type) => {

    if (!coords) {
      setError("Location still loading. Please wait.");
      return;
    }

    setLoading(true);
    setError("");
    setDistanceInfo(null);

    try {

      const res = await fetch(`${BACKEND_URL}/gemini-transport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          destination,
          type
        })
      });

      const data = await res.json();

      if (!data.ok) {
        setError("Could not find nearest location.");
        setLoading(false);
        return;
      }

      setSelectedPlace(data.place);

      const distRes = await fetch(`${BACKEND_URL}/distance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: coords,
          to: data.place
        })
      });

      const distData = await distRes.json();

      if (distData.ok) setDistanceInfo(distData);

    } catch (err) {

      console.error("Transport error:", err);
      setError("Server error while fetching transport.");

    }

    setLoading(false);
  };

  /* ================= UI ================= */

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white px-6 py-16 overflow-hidden">

      <div className="relative max-w-6xl mx-auto space-y-12">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-10 shadow-2xl"
        >

          <h1 className="text-5xl font-extrabold mb-4">
            📍 {destination}
          </h1>

          {about ? (
            <p className="text-white/80 max-w-3xl leading-relaxed">
              {about}
            </p>
          ) : (
            <p className="text-white/50">
              Loading destination details...
            </p>
          )}

          {mapCoords && (
  <iframe
    title="map"
    className="w-full h-[350px] rounded-2xl mt-8 border border-white/20 shadow-xl"
    src={`https://www.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}&z=14&output=embed`}
  />
)}

        </motion.div>

        <button
          onClick={() => setShowAgentForm(true)}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg"
        >
          Book with AI Agent
        </button>

      </div>

      <Chatbot monument={destination} />

      {showAgentForm && (
        <AgentBookingModal
          defaultMonument={destination}
          onClose={() => setShowAgentForm(false)}
        />
      )}

    </div>
  );
}