import React from 'react';

const FormSelect = ({ label, options, register, name, className = "", error, ...props }) => (
  <div className={`mb-2 ${className}`}>
    <label className="block text-xs font-bold uppercase text-gray-600 py-1">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <select
      {...register(name)}
      {...props}
      className={`w-full border-2 rounded-lg border-gray-600 bg-transparent px-2 py-1 outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 ${error ? 'border-red-500' : ''}`}
    >
      <option value="">Select</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    {error && (
        <span className="text-red-500 text-xs block mt-1">
          {error.message || "Required"}
        </span>
      )}
  </div>
);

export default FormSelect;
