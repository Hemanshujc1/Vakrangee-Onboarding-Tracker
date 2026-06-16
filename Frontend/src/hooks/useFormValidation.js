import { useState } from "react";

export const useFormValidation = (initialState, schemaMap) => {
  const [formData, setFormData] = useState(initialState);
  const [fieldErrors, setFieldErrors] = useState({});

  const validateField = async (name, value) => {
    const schema = schemaMap[name];
    if (!schema) return true;
    try {
      await schema.validate(value);
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
      return true;
    } catch (err) {
      setFieldErrors((prev) => ({ ...prev, [name]: err.message }));
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Re-validate live only if the field already has an error shown
    if (fieldErrors[name]) {
      validateField(name, value);
    }
  };

  const validateAll = async (fieldsToValidate) => {
    const results = await Promise.all(
      fieldsToValidate.map((name) => validateField(name, formData[name]))
    );
    return results.every((isValid) => isValid);
  };

  const resetForm = (newState) => {
    setFormData(newState);
    setFieldErrors({});
  };

  return {
    formData,
    setFormData,
    fieldErrors,
    handleChange,
    validateField,
    validateAll,
    resetForm,
  };
};
