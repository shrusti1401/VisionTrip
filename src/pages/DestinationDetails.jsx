import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Chatbot from "../components/Chatbot";

const BACKEND_URL = "http://localhost:8000"; // ✅ SAME AS HERO

export default function DestinationDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const destination =
    location.state?.destination ||
    new URLSearchParams(location.search).get("destination");

  const [coords, setCoords] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [about, setAbout] = useState(null);
  const [error, setError] = useState("");

  /* ---------------- REDIRECT IF NO DESTINATION ---------------- */

  useEffect(() => {
    if (!destination) {
      navigate("/", { replace: true });
    }
  }, [destination, navigate]);

  /* ---------------- FETCH ABOUT INFO ---------------- */

  useEffect(() => {
    if (!destination) return;

    const fetchAbout = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/gemini-about`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destination }),
        });

        if (!res.ok) {
          throw new Error("Server not responding");
        }

        const data = await res.json();

        if (data.ok) {
          setAbout(data.data);
        } else {
          setError(data.error || "Could not load destination info.");
        }

      } catch (err) {
        console.error("About fetch error:", err);
        setError("Backend not reachable. Make sure server is running.");
      }
    };

    fetchAbout();
  }, [destination]);

  /* ---------------- FETCH CITY CENTER ---------------- */

  useEffect(() => {
    if (!destination) return;

    const fetchCoords = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/gemini-transport`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destination,
            type: "city center",
          }),
        });

        if (!res.ok) throw new Error("Transport fetch failed");

        const data = await res.json();

        if (data.ok) {
          setCoords(data.place);
        }

      } catch (err) {
        console.error("Coords error:", err);
      }
    };

    fetchCoords();
  }, [destination]);

  /* ---------------- FETCH TRANSPORT ---------------- */

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, type }),
      });

      if (!res.ok) throw new Error("Transport error");

      const data = await res.json();

      if (!data.ok) {
        setError("Could not find nearest location.");
        setLoading(false);
        return;
      }

      setSelectedPlace(data.place);

      const distRes = await fetch(`${BACKEND_URL}/distance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: {
            lat: coords.lat,
            lng: coords.lng,
          },
          to: {
            lat: data.place.lat,
            lng: data.place.lng,
          },
        }),
      });

      if (!distRes.ok) throw new Error("Distance error");

      const distData = await distRes.json();

      if (distData.ok) {
        setDistanceInfo(distData);
      }

    } catch (err) {
      console.error("Transport error:", err);
      setError("Server error while fetching transport.");
    }

    setLoading(false);
  };

  /* ---------------- UI ---------------- */

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

          {coords && (
            <iframe
              title="map"
              className="w-full h-[350px] rounded-2xl mt-8 border border-white/20 shadow-xl"
              src={`https://www.google.com/maps?q=${
                selectedPlace
                  ? `${selectedPlace.lat},${selectedPlace.lng}`
                  : `${coords.lat},${coords.lng}`
              }&z=14&output=embed`}
            />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl"
        >
          <h2 className="text-2xl font-semibold mb-8">
            🚖 Nearby Transport
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            <button
              disabled={!coords || loading}
              onClick={() => fetchGeminiPlace("bus station")}
              className="bg-green-600/80 hover:bg-green-500 disabled:opacity-40 transition py-4 rounded-xl font-semibold"
            >
              🚌 Bus Station
            </button>

            <button
              disabled={!coords || loading}
              onClick={() => fetchGeminiPlace("railway station")}
              className="bg-purple-600/80 hover:bg-purple-500 disabled:opacity-40 transition py-4 rounded-xl font-semibold"
            >
              🚆 Railway
            </button>

            <button
              disabled={!coords || loading}
              onClick={() => fetchGeminiPlace("airport")}
              className="bg-blue-600/80 hover:bg-blue-500 disabled:opacity-40 transition py-4 rounded-xl font-semibold"
            >
              ✈ Airport
            </button>

          </div>

          {loading && (
            <p className="mt-6 text-white/50">
              Finding nearest location...
            </p>
          )}

          {error && (
            <p className="mt-4 text-red-400">
              {error}
            </p>
          )}

          {selectedPlace && distanceInfo && (
            <div className="mt-8">
              <p className="text-lg font-semibold">
                📍 {selectedPlace.name}
              </p>

              <div className="flex gap-4 mt-3">
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
                  {distanceInfo.distance_km} km
                </span>
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
                  {distanceInfo.duration_min} mins
                </span>
              </div>
            </div>
          )}
        </motion.div>

        <button
          onClick={() =>
            navigate(`/create-trip?destination=${destination}`, {
              state: { destination },
            })
          }
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl py-5 rounded-2xl shadow-2xl font-bold"
        >
          Generate Itinerary 🧳
        </button>

      </div>

      <Chatbot monument={destination} />
    </div>
  );
}