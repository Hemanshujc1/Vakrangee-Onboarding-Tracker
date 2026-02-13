import React from "react";
import { Loader2 } from "lucide-react";

const FormActions = ({
  isSubmitting,
  onSaveDraft,
  onSubmit,
  saveLabel = "Save Draft",
  submitLabel = "Preview & Submit",
  hideSaveDraft = false,
}) => {
  return (
    <div className="flex flex-row justify-center gap-4 mt-8 pb-8 print:hidden pt-4 border-t border-gray-100">
      {!hideSaveDraft && (
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSaveDraft}
          className="px-4 py-2.5 border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center text-center gap-2 w-fit"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {saveLabel}
        </button>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        onClick={onSubmit}
        className="px-4 py-2.5 bg-black text-white rounded font-medium hover:bg-gray-900 disabled:opacity-50 shadow-sm transition-all transform active:scale-95 flex items-center text-center gap-2 w-fit"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>
    </div>
  );
};

export default FormActions;
