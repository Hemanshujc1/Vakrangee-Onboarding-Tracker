import React from "react";

const ProfileInputField = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  required,
  type = "text",
  maxLength,
  minLength,
  onInput,
  max,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        maxLength={maxLength}
        minLength={minLength}
        onInput={onInput}
        max={max}
        className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${
          error ? "border-red-500" : "border-gray-200"
        } ${
          disabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default ProfileInputField;
