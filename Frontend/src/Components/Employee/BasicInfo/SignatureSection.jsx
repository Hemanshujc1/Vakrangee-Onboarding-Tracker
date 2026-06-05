import React from "react";
import { PenTool, Upload } from "lucide-react";

const SignatureSection = ({
  previewSignature,
  isEditing,
  handleSignatureChange,
  isLocked,
  signatureStatus,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 pt-6 border-t border-gray-100 text-center sm:text-left">
      <div className="relative group shrink-0">
        <div className="w-40 sm:w-48 h-16 sm:h-20 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
          {previewSignature ? (
            <img
              src={previewSignature}
              alt="Signature"
              className="h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <PenTool size={24} className="mb-1" />
              <span className="text-xs">No Signature</span>
            </div>
          )}
        </div>
        {isEditing && (!isLocked || signatureStatus?.status === "REJECTED") && (
          <label className="absolute -bottom-3 -right-3 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 border border-gray-200">
            <Upload size={16} className="text-gray-600" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleSignatureChange}
            />
          </label>
        )}
      </div>
      <div className="pt-2 flex-1">
        <h3 className="font-semibold text-lg text-gray-800">
          Digital Signature
        </h3>
        <p className="text-sm text-gray-500 max-w-sm">
          {isEditing
            ? "Upload a clear image of your handwritten signature."
            : "Your official signature."}
        </p>
        {signatureStatus?.status === "REJECTED" &&
          signatureStatus.data?.rejection_reason && (
            <div className="mt-2 text-[10px] text-red-600 font-medium bg-red-50 p-2 rounded border border-red-100 max-w-sm">
              <span className="font-bold">Rejection Reason:</span>{" "}
              {signatureStatus.data.rejection_reason}
            </div>
          )}
      </div>
    </div>
  );
};

export default SignatureSection;
