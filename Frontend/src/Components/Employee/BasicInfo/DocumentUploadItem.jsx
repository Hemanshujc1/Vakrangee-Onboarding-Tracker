import React from "react";
import { Upload, Trash2, Eye, CheckCircle, AlertCircle } from "lucide-react";

const DocumentUploadItem = ({
  label,
  docKey,
  status,
  data,
  isUploading,
  handleUpload,
  handleDelete,
  isEditing,
  optional = false,
  verificationStatus,
}) => {
  return (
    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 w-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className={`p-2 rounded-lg shrink-0 ${status === "UPLOADED" || status === "VERIFIED" ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-400"}`}
          >
            {status === "UPLOADED" || status === "VERIFIED" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
          </div>
          <div className="min-w-0">
            <h5 className="text-sm font-semibold text-gray-800 flex flex-wrap items-center gap-1 leading-snug">
              {label}
              {optional && (
                <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded-full uppercase">
                  Optional
                </span>
              )}
            </h5>
            {status === "VERIFIED" && (
              <span className="text-[10px] text-green-700 font-medium">Verified</span>
            )}
            {status === "REJECTED" && (
              <span className="text-[10px] text-red-700 font-medium">Rejected</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {data && (
            <a
              href={
                docKey === "Passport Size Photo"
                  ? `/uploads/profilepic/${data.file_path}`
                  : docKey === "Signature"
                  ? `/uploads/signatures/${data.file_path}`
                  : `/uploads/documents/${data.file_path}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="View"
            >
              <Eye size={16} />
            </a>
          )}

          {isEditing && (
            <>
              {data && status === "UPLOADED" && (
                <button
                  type="button"
                  onClick={() => handleDelete(data.id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              )}

              {(!data || status === "REJECTED") && (
                <div className="relative">
                  <input
                    type="file"
                    id={`file-${docKey}`}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleUpload(e.target.files[0], docKey)}
                    disabled={
                      isUploading ||
                      status === "VERIFIED" ||
                      verificationStatus === "SUBMITTED"
                    }
                  />
                  <label
                    htmlFor={`file-${docKey}`}
                    className={`flex items-center gap-2 px-3 py-1.5 border border-dashed border-gray-300 rounded-md text-xs text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer ${
                      isUploading ||
                      status === "VERIFIED" ||
                      verificationStatus === "SUBMITTED"
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }`}
                  >
                    <Upload size={14} />
                    <span>
                      {isUploading
                        ? "..."
                        : data
                        ? "Re-upload"
                        : "Upload"}
                    </span>
                  </label>
                </div>
              )}
            </>
          )}
          {!isEditing && !data && (
            <span className="text-[10px] text-gray-400 italic">
              Not uploaded
            </span>
          )}
        </div>
      </div>

      {status === "REJECTED" && data?.rejection_reason && (
        <p className="text-[10px] text-red-600 font-medium bg-red-50 p-1.5 rounded border border-red-100">
          Reason: {data.rejection_reason}
        </p>
      )}
    </div>
  );
};

export default DocumentUploadItem;
