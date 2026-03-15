// src/components/ui/custom/Header.jsx
import React from "react";

function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-md z-50">
      <div className="flex justify-between items-center p-3 md:p-4 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-purple-600 font-[Great_Vibes,cursive] tracking-wide">
          VisionTrip
        </h1>

        <button className="text-sm font-medium border border-gray-300 py-1.5 px-4 rounded-lg hover:bg-gray-50 transition duration-150 bg-white text-gray-900 shadow-sm">
          Sign In
        </button>
      </div>
    </header>
  );
}

export default Header;
