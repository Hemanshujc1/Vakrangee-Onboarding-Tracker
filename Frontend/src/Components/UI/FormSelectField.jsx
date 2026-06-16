import React from "react";

const FormSelectField = ({
  label,
  name,
  register,
  errors,
  isEditing,
  value,
  options = [],
  disabled = false,
  required = false,
  className = "",
  placeholder = "Select..."
}) => {
  const baseClass = "w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary)";
  const errorClass = errors?.[name] ? "border-red-500" : "border-gray-200";
  const bgClass = disabled ? "bg-gray-100" : "bg-white";
  const cursorClass = disabled ? "cursor-not-allowed text-gray-500" : "";
  
  return (
    <div className={className}>
      <label className="block text-sm text-gray-500 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {isEditing ? (
        <>
          <select
            {...register(name)}
            disabled={disabled}
            className={`${baseClass} ${errorClass} ${bgClass} ${cursorClass}`}
          >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors?.[name] && (
            <p className="text-red-500 text-xs mt-1">
              {errors[name].message}
            </p>
          )}
        </>
      ) : (
        <p className="font-medium text-gray-800 py-2">
          {value || "-"}
        </p>
      )}
    </div>
  );
};

export default FormSelectField;
