import React from "react";

// This component receives the card data and a boolean for selection state
function OptionCard({ emoji, title, subtitle, isSelected = false }) {
  // Tailwind classes for the selected state
  const selectedClasses = isSelected
    ? "border-red-500 ring-2 ring-red-500 bg-red-50"
    : "border-gray-300 hover:border-red-300 hover:shadow-md";

  return (
    <div
      className={`
        border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 
        ${selectedClasses}
      `}
      // In a real app, you would add an onClick handler here
    >
      {/* Emoji/Icon */}
      <div className="text-3xl mb-2">{emoji}</div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>

      {/* Subtitle/Description */}
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

export default OptionCard;
