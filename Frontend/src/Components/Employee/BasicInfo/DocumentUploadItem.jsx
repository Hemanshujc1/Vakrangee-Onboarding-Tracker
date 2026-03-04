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
}) => {
  return (
    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${status === "UPLOADED" || status === "VERIFIED" ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-400"}`}
          >
            {status === "UPLOADED" || status === "VERIFIED" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
          </div>
          <div>
            <h5 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              {label}
              {optional && (
                <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded-full uppercase">
                  Optional
                </span>
              )}
            </h5>
            {status === "VERIFIED" && (
              <span className="text-[10px] text-green-700 font-medium">
                Verified
              </span>
            )}
            {status === "REJECTED" && (
              <span className="text-[10px] text-red-700 font-medium">
                Rejected
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {data ? (
            <>
              <a
                href={`/uploads/documents/${data.file_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="View"
              >
                <Eye size={16} />
              </a>
              {status !== "VERIFIED" && (
                <button
                  type="button"
                  onClick={() => handleDelete(data.id)}
                  className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </>
          ) : (
            <div className="relative">
              <input
                type="file"
                id={`file-${docKey}`}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleUpload(e.target.files[0], docKey)}
                disabled={isUploading}
              />
              <label
                htmlFor={`file-${docKey}`}
                className={`flex items-center gap-2 px-3 py-1.5 border border-dashed border-gray-300 rounded-md text-xs text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
              >
                <Upload size={14} />
                <span>{isUploading ? "..." : "Upload"}</span>
              </label>
            </div>
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
