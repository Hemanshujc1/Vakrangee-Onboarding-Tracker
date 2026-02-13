import React from "react";

const FormTextArea = ({
  label,
  register,
  name,
  className = "",
  error,
  ...props
}) => (
  <div className={`mb-4 w-full ${className}`}>
    <label className="block text-sm font-semibold mb-2">{label}</label>
    <textarea
      {...register(name)}
      {...props}
      className={`ruled-textarea w-full border rounded p-2 outline-none resize-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 ${error ? "border-red-500" : ""}`}
      rows={5}
    />
    {error && (
      <span className="text-red-500 text-xs block mt-1">
        {error.message || "Required"}
      </span>
    )}
  </div>
);

export default FormTextArea;
