import { useNavigate } from "react-router-dom";
import { Briefcase, Eye, CheckCircle, X } from "lucide-react";

const DocumentList = ({ documents, handleDocumentVerification }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const rolePath = user.role === "HR_SUPER_ADMIN" ? "hr-super-admin" : "hr-admin";
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
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
                      doc.status === "VERIFIED"
                        ? "bg-(--color-accent-sage)/10 text-(--color-accent-sage)"
                        : doc.status === "REJECTED"
                          ? "bg-(--color-accent-orange)/10 text-(--color-accent-orange)"
                          : "bg-(--color-primary)/10 text-(--color-primary)"
                    }`}
                  >
                    {doc.status}
                  </span>
                  {doc.verified_by && doc.verifiedByName && (
                    <p className="text-[10px] text-gray-500 font-medium">
                      Reviewed By: {doc.verifiedByName}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => navigate(`/${rolePath}/employees/${doc.employee_id}/documents/${doc.id}/preview`)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded bg-white text-(--color-primary) border border-(--color-primary)/20 hover:bg-(--color-primary)/5 transition-all text-xs font-bold"
                    title="View Document"
                  >
                    <Eye size={14} />
                    <span>View Document</span>
                  </button>
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
