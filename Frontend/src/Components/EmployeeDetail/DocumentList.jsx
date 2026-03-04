import React from "react";
import { Briefcase, Eye, CheckCircle, X } from "lucide-react";

const DocumentList = ({ documents, handleDocumentVerification }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-[#4E4E4E]">Uploaded Documents</h3>
        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
          <Briefcase size={20} />
        </div>
      </div>

      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="border border-gray-100 rounded-lg bg-gray-50 p-4 flex flex-col justify-between gap-3"
            >
              {/* Document Info */}
              <div className="space-y-1">
                <p className="font-semibold text-sm text-gray-800">
                  {doc.document_type}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${
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
                    <p className="text-[10px] text-gray-500">
                      {doc.verifiedByName}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 justify-end">
                {/* View */}
                <a
                  href={`/uploads/documents/${doc.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded bg-white border border-gray-200 text-blue-500 hover:bg-gray-100"
                  title="View"
                >
                  <Eye size={14} />
                </a>

                {/* Verify / Reject */}
                {(doc.status === "PENDING" || doc.status === "UPLOADED") && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() =>
                        handleDocumentVerification(doc.id, "VERIFIED")
                      }
                      className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200"
                      title="Approve"
                    >
                      <CheckCircle size={14} />
                    </button>

                    <button
                      onClick={() =>
                        handleDocumentVerification(doc.id, "REJECTED")
                      }
                      className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      title="Reject"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Rejection Reason */}
              {doc.status === "REJECTED" && doc.rejection_reason && (
                <div className="text-[10px] text-red-600 bg-red-50 p-2 rounded border border-red-100">
                  <span className="font-semibold">Reason:</span>{" "}
                  {doc.rejection_reason}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">
          No documents uploaded yet.
        </p>
      )}
    </div>
  );
};

export default DocumentList;
