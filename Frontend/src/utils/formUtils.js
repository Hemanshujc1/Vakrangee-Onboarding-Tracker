export const onValidationFail = (errors, showAlert) => {
  console.error("Validation Errors:", errors);
  const errorFields = Object.keys(errors).join(", ");
  const message = `Validation Failed. Please check the following fields: ${errorFields}`;
  
  if (showAlert) {
      showAlert(message, { type: 'error' });
  } else {
      // Fallback or just log
      console.warn("showAlert function not provided to onValidationFail");
      // Intentionally not using alert() to meet requirement
  }
};

export const formatDateForAPI = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toISOString().split('T')[0];
  } catch (e) {
    return dateString;
  }
};

