import React from "react";
import { Briefcase, CheckCircle, X } from "lucide-react";

const DocumentList = ({ documents, handleDocumentVerification }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#4E4E4E]">Uploaded Documents</h3>
        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
          <Briefcase size={20} />
        </div>
      </div>

      {documents.length > 0 ? (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border border-gray-100 rounded-lg bg-gray-50 gap-3"
            >
              <div>
                <p className="font-semibold text-gray-800">
                  {doc.document_type}
                </p>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    doc.status === "VERIFIED"
                      ? "bg-green-100 text-green-700"
                      : doc.status === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {doc.status}
                </span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {doc.status === "VERIFIED" && doc.verifiedByName && (
                  <span className="text-xs text-gray-500 hidden sm:block mr-2">
                    Verified by: {doc.verifiedByName}
                  </span>
                )}
                <a
                  href={`http://localhost:3001/uploads/documents/${doc.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline break-all"
                >
                  View File
                </a>
                {doc.status === "VERIFIED" && doc.verifiedByName && (
                  <span className="text-[10px] text-gray-500 mt-1 block sm:hidden">
                    By: {doc.verifiedByName}
                  </span>
                )}

                {doc.status !== "VERIFIED" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleDocumentVerification(doc.id, "VERIFIED")
                      }
                      className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200"
                      title="Verify"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() =>
                        handleDocumentVerification(doc.id, "REJECTED")
                      }
                      className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      title="Reject"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
              {doc.status === "REJECTED" && doc.rejection_reason && (
                <div className="w-full text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 mt-2 sm:mt-0">
                  Reason: {doc.rejection_reason}
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
