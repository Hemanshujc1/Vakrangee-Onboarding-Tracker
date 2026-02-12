import React from "react";

export const PrintText = ({ value = "", className = "" }) => {
  return (
    <div
      className={`border-b border-gray-800 px-2 py-1 font-mono uppercase flex items-center min-h-6 ${className}`}
    >
      {value || ""}
    </div>
  );
};

export const PrintCheckbox = ({ label, checked }) => (
  <div className="flex items-center gap-2 mr-4">
    <div className="w-5 h-5 border border-gray-800 flex items-center justify-center">
      {checked && <span className="font-bold text-xs">✓</span>}
    </div>
    <span className="font-semibold">{label}</span>
  </div>
);

export const PrintSectionHeader = ({ title }) => (
  <div className="bg-gray-100 italic tracking-wider font-bold text-black border border-gray-800 p-1 text-center text-sm mb-2 mt-4">
    {title}
  </div>
);

export const PrintDateBlock = ({ date }) => {
  // Expects YYYY-MM-DD or ISO string
  if (!date)
    return (
      <div className="border-b border-gray-800 px-2 py-1 min-w-25 text-center">
        DD/MM/YYYY
      </div>
    );
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear().toString();

  return (
    <div className="font-mono border-b border-gray-800 px-2 py-1 min-w-25 text-center">
      {day}/{month}/{year}
    </div>
  );
};

export const LinedTextArea = ({ value = "", minLines = 3, className = "" }) => {
  const lineHeight = 32; // 2rem = 32px (h-8)

  return (
    <div
      className={`w-full ${className}`}
      style={{
        // Create lines using gradient: transparent for most of the height, then a 1px border line
        backgroundImage:
          "linear-gradient(transparent calc(2rem - 1px), #1f2937 calc(2rem - 1px))",
        backgroundSize: "100% 2rem", // Repeat every 2rem
        minHeight: `${minLines * 2}rem`,
      }}
    >
      <div className="w-full h-full whitespace-pre-wrap px-1 leading-8 text-sm">
        {value || ""}
      </div>
    </div>
  );
};
