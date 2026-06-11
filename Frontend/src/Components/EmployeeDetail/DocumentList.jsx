import { useNavigate } from "react-router-dom";
import { Briefcase, Eye } from "lucide-react";

const DocumentList = ({ documents = [], employeeId }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const rolePath = user.role === "HR_SUPER_ADMIN" ? "hr-super-admin" : "hr-admin";

  const MANDATORY_DOCUMENTS = [
    "Passport Size Photo",
    "Signature",
    "PAN Card",
    "Aadhar Card",
    "10th Marksheet",
    "12th Marksheet",
    "Degree Certificate",
    "Cancelled Cheque",
  ];

  // 1. Map existing documents by type for easy lookup
  const docsMap = {};
  documents.forEach((doc) => {
    docsMap[doc.document_type] = doc;
  });

  // 2. Build list of items to render
  const itemsToRender = [];

  // Add mandatory documents first
  MANDATORY_DOCUMENTS.forEach((docType) => {
    if (docsMap[docType]) {
      itemsToRender.push({
        type: docType,
        isMandatory: true,
        isUploaded: true,
        data: docsMap[docType],
      });
    } else {
      itemsToRender.push({
        type: docType,
        isMandatory: true,
        isUploaded: false,
        data: null,
      });
    }
  });

  // Add any non-mandatory documents that were uploaded
  documents.forEach((doc) => {
    if (!MANDATORY_DOCUMENTS.includes(doc.document_type)) {
      itemsToRender.push({
        type: doc.document_type,
        isMandatory: false,
        isUploaded: true,
        data: doc,
      });
    }
  });

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#4E4E4E]">Onboarding Documents</h3>
          <p className="text-xs text-gray-500">Mandatory and uploaded files for verification</p>
        </div>
        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
          <Briefcase size={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {itemsToRender.map((item) => {
          if (item.isUploaded) {
            const doc = item.data;
            return (
              <div
                key={doc.id}
                className="border border-gray-100 rounded-lg bg-gray-50 p-4 flex flex-col justify-between gap-3 font-inter shadow-xs"
              >
                {/* Document Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 justify-between">
                    <p className="font-semibold text-sm text-gray-800">
                      {doc.document_type}
                    </p>
                    {item.isMandatory && (
                      <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
                        doc.status === "VERIFIED"
                          ? "bg-green-100 text-green-800"
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
                <div className="flex items-center gap-2 justify-end mt-2">
                  <button
                    onClick={() =>
                      navigate(
                        `/${rolePath}/employees/${employeeId}/documents/${doc.id}/preview`
                      )
                    }
                    className="flex items-center gap-2 px-3 py-1.5 rounded bg-white text-(--color-primary) border border-(--color-primary)/20 hover:bg-(--color-primary)/5 transition-all text-xs font-bold shadow-xs"
                    title="View Document"
                  >
                    <Eye size={14} />
                    <span>View Document</span>
                  </button>
                </div>

                {/* Rejection Reason */}
                {doc.status === "REJECTED" && doc.rejection_reason && (
                  <div className="text-[10px] text-red-600 bg-red-50 p-2 rounded border border-red-100">
                    <span className="font-semibold">Reason:</span> {doc.rejection_reason}
                  </div>
                )}
              </div>
            );
          } else {
            return (
              <div
                key={item.type}
                className="border border-dashed border-gray-200 rounded-lg bg-gray-50/50 p-4 flex flex-col justify-between gap-3 opacity-60 font-inter"
              >
                {/* Document Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 justify-between">
                    <p className="font-semibold text-sm text-gray-500">
                      {item.type}
                    </p>
                    <span className="text-[9px] font-bold text-red-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                      Mandatory
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-500">
                      PENDING UPLOAD
                    </span>
                  </div>
                </div>

                {/* Actions Placeholder */}
                <div className="flex items-center gap-2 justify-end min-h-[32px]">
                  <span className="text-[10px] text-gray-400 italic">Not uploaded yet</span>
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

export default DocumentList;
