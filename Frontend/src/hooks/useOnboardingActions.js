import { useCallback } from "react";

const useOnboardingActions = ({
  isSubmitting,
  setValue,
  getValues,
  isPreviewRef,
  setIsPreviewMode,
  onFormSubmit,
  errors,
  signaturePreview,
  setSignaturePreview,
  hasSavedSignature,
}) => {
  const actions = {
    isSubmitting,
    onSaveDraft: useCallback(() => {
      setValue("isDraft", true);
      if (isPreviewRef && isPreviewRef.hasOwnProperty("current")) {
        isPreviewRef.current = false;
      }
      if (typeof setIsPreviewMode === "function") {
        setIsPreviewMode(false);
      }
      const currentValues = { ...getValues(), isDraft: true };
      onFormSubmit(currentValues);
    }, [setValue, isPreviewRef, setIsPreviewMode, getValues, onFormSubmit]),
    onSubmit: useCallback(() => {
      setValue("isDraft", true);
      if (isPreviewRef && isPreviewRef.hasOwnProperty("current")) {
        isPreviewRef.current = true;
      }
    }, [setValue, isPreviewRef]),
  };

  const signatureProps = {
    setValue,
    error: errors?.signature,
    preview: signaturePreview,
    setPreview: setSignaturePreview,
    isSaved: hasSavedSignature,
    fieldName: "signature",
  };

  return { actions, signatureProps };
};

export default useOnboardingActions;
