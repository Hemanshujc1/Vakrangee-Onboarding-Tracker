import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Input = React.forwardRef(({ label, error, className, id, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={id}
          className={cn(
            "px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full",
            error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
            props.endIcon && "pr-10",
            className
          )}
          {...props}
        />
        {props.endIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {props.endIcon}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
});
Input.displayName = "Input";

export default Input;
