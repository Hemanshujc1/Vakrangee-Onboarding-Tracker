import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const variants = {
  default: "bg-gray-100 text-gray-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  overdue: "bg-red-100 text-red-800 border border-red-200",
  info: "bg-blue-100 text-blue-800",
};

const Badge = ({ children, variant = "default", className }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
