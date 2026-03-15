// src/components/ui/custom/Hero.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PhotoIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

const heroBgImage =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2070&auto=format&fit=crop";

const Hero = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError("");
    } else {
      setSelectedFile(null);
      setPreview(null);
      setError("Please select a valid image file.");
    }
  };

  const handleGoClick = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/predict-destination", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.destination) {
        navigate("/destination", {
          state: { destination: data.destination },
        });
      } else {
        setError(data.error || "Failed to identify destination.");
      }
    } catch (err) {
      setError("AI server not running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-6 text-white overflow-hidden"
      style={{
        backgroundImage: `url(${heroBgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Floating Gradient Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-200" />

      {/* Logo */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute top-6 text-4xl font-extrabold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent"
      >
        VisionMate
      </motion.h2>

      <div className="relative z-10 max-w-6xl w-full grid md:grid-cols-2 gap-16 items-center">

        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Discover Your Next Journey With{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI
            </span>
          </h1>

          <p className="mt-6 text-lg text-white/80 max-w-xl">
            Upload any travel photo and instantly generate a personalized trip
            itinerary with nearby transport, landmarks and hidden gems.
          </p>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-3 rounded-full font-semibold shadow-2xl"
          >
            Get Started — Free
          </motion.button>
        </motion.div>

        {/* RIGHT CARD */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/30 transition-all"
        >
          <h3 className="text-2xl font-semibold mb-6 text-center">
            Upload Destination Image 📸
          </h3>

          <motion.label
            whileHover={{ scale: 1.03 }}
            htmlFor="file-upload"
            className="relative w-full h-64 rounded-2xl border-2 border-dashed border-white/40 flex items-center justify-center cursor-pointer overflow-hidden"
            style={{
              backgroundImage: preview ? `url(${preview})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!preview && (
              <div className="text-center">
                <PhotoIcon className="h-14 w-14 mx-auto text-white/70" />
                <p className="mt-2">Click or drag image</p>
              </div>
            )}

            <input
              id="file-upload"
              type="file"
              className="sr-only"
              onChange={handleFileChange}
              accept="image/png, image/jpeg"
            />
          </motion.label>

          {error && (
            <p className="text-red-300 text-sm mt-4 bg-red-900/40 p-2 rounded">
              {error}
            </p>
          )}

          <motion.button
            onClick={handleGoClick}
            disabled={!selectedFile || loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 w-full bg-white text-black py-3 rounded-full font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Recognizing...
              </>
            ) : (
              <>
                Generate Trip{" "}
                <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;