import React from 'react';

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
  return (
    <div className={`relative ${className}`}>
      {/* Background Lines */}
      <div className="absolute inset-0 flex flex-col pointer-events-none">
        {Array.from({ length: minLines }).map((_, i) => (
          <div
            key={i}
            className="border-b border-gray-800 h-8 box-border w-full"
          ></div>
        ))}
      </div>

      {/* Text Content Overlay - Line height matches h-8 (2rem) */}
      <div 
        className="relative z-10 p-0 text-sm leading-8 whitespace-pre-wrap pt-0.5 pl-1"
        style={{ minHeight: `${minLines * 2}rem` }}
      >
        {value || ""}
      </div>
    </div>
  );
};
