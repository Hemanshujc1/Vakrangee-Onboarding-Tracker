import React from 'react';
import { cn } from './Badge'; 

const ProgressBar = ({ value, max = 100, className, colorClass = "bg-blue-600" }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-2.5", className)}>
      <div
        className={cn("h-2.5 rounded-full transition-all duration-500", colorClass)}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;