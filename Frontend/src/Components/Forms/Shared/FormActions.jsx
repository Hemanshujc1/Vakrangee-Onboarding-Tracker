import React from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FormActions = ({
  isSubmitting,
  onSaveDraft,
  onSubmit,
  saveLabel = "Save Draft",
  submitLabel = "Preview & Submit",
  hideSaveDraft = false,
}) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-row justify-between gap-4 print:hidden w-full">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 w-fit px-2 py-2.5 font-medium transition-colors"
      >
        <ArrowLeft size={20} />
        Back
      </button>
      <div className="flex flex-row justify-end gap-4">
        {!hideSaveDraft && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={async (e) => {
              try {
                if (onSaveDraft) await onSaveDraft(e);
              } catch (err) {
                alert("Error saving draft: " + err.message);
                console.error(err);
              }
            }}
            className="px-4 py-2.5 border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center text-center gap-2 w-fit"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {saveLabel}
          </button>
        )}
        <button
          type="submit"
          form="onboarding-form"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="px-4 py-2.5 bg-black text-white rounded font-medium hover:bg-gray-900 disabled:opacity-50 shadow-sm transition-all transform active:scale-95 flex items-center text-center gap-2 w-fit"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </div>
  );
};

export default FormActions;
