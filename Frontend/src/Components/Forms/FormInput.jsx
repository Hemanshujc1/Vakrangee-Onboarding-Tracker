import React from "react";

const FormInput = ({
  label,
  type = "text",
  register,
  name,
  className = "",
  error,
  ...props
}) => (
  <div className={`mb-2 w-full ${className}`}>
    <label className="block text-xs font-bold uppercase text-gray-600 py-1">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      {...register(name)}
      {...props}
      className={`w-full border-dashed border-b border-gray-600 bg-transparent px-2 py-1 outline-none focus:border-blue-600 transition-colors disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 ${error ? "border-red-500" : ""}`}
    />
    {error && (
      <span className="text-red-500 text-xs block mt-1">
        {error.message || "Required"}
      </span>
    )}
  </div>
);

export default FormInput;
