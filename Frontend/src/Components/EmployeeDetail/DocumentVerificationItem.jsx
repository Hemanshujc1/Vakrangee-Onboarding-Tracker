import React from "react";
import { Eye, CheckCircle, X } from "lucide-react";

const DocumentVerificationItem = ({ doc, handleDocumentVerification }) => {
  if (!doc)
    return (
      <div className="text-[10px] text-gray-400 italic mt-1">
        Pending upload
      </div>
    );

  return (
    <div className="flex flex-col gap-1 mt-1 p-2 bg-gray-50 rounded border border-gray-100">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-fit ${
              doc.status === "VERIFIED"
                ? "bg-green-100 text-green-700"
                : doc.status === "REJECTED"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
            }`}
          >
            {doc.status}
          </span>
          {doc.status === "VERIFIED" && doc.verifiedByName && (
            <span className="text-[9px] text-gray-400">
              by {doc.verifiedByName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={`/uploads/documents/${doc.file_path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded bg-white border border-gray-200 text-blue-500 hover:bg-gray-100"
            title="View"
          >
            <Eye size={14} />
          </a>

          {(doc.status === "PENDING" || doc.status === "UPLOADED") && (
            <>
              <button
                onClick={() => handleDocumentVerification(doc.id, "VERIFIED")}
                className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                title="Approve"
              >
                <CheckCircle size={14} />
              </button>
              <button
                onClick={() => handleDocumentVerification(doc.id, "REJECTED")}
                className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                title="Reject"
              >
                <X size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {doc.status === "REJECTED" && doc.rejection_reason && (
        <div className="text-[9px] text-red-600 bg-red-50 p-1 rounded border border-red-100 mt-1">
          <span className="font-semibold">Reason:</span> {doc.rejection_reason}
        </div>
      )}
    </div>
  );
};

export default DocumentVerificationItem;
