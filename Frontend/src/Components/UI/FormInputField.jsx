import React from "react";

const FormInputField = ({
  label,
  name,
  register,
  errors,
  isEditing,
  value,
  type = "text",
  placeholder = "",
  disabled = false,
  required = false,
  className = "",
  readOnly = false,
  maxLength,
  minLength,
  onInput,
  inputMode,
  step,
  max,
}) => {
  const baseClass = "w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary)";
  const errorClass = errors?.[name] ? "border-red-500" : "border-gray-200";
  const bgClass = disabled || readOnly ? "bg-gray-100" : "bg-white";
  const cursorClass = disabled || readOnly ? "cursor-not-allowed text-gray-500" : "";
  
  return (
    <div className={className}>
      <label className="block text-sm text-gray-500 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {isEditing ? (
        <>
          <input
            {...register(name)}
            type={type}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            maxLength={maxLength}
            minLength={minLength}
            onInput={onInput}
            inputMode={inputMode}
            step={step}
            max={max}
            className={`${baseClass} ${errorClass} ${bgClass} ${cursorClass}`}
          />
          {errors?.[name] && (
            <p className="text-red-500 text-xs mt-1">
              {errors[name].message}
            </p>
          )}
        </>
      ) : (
        <p className={`font-medium py-2 ${disabled || readOnly ? "bg-gray-50 px-2 rounded-md text-gray-800" : "text-gray-800"}`}>
          {value || "-"}
        </p>
      )}
    </div>
  );
};

export default FormInputField;
