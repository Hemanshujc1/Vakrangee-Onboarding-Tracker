import React from "react";
import DocumentUploadItem from "./DocumentUploadItem";
import { DOCUMENT_CONFIG, DOC_CONFIG_MAP } from "../../../config/documentConfig";


const FINANCIAL_DOCS = DOCUMENT_CONFIG.filter((d) => d.section === "financial");

const FinancialHRDocumentsSection = ({
  isEditing,
  getDocStatus,
  uploadingState,
  handleUpload,
  handleDelete,
  isLocked,
  verificationStatus,
}) => {
  return (
    <>
      <div className="mt-6 mb-6">
        <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
          Financial & HR Documents
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:col-span-2">
        {FINANCIAL_DOCS.map((docCfg) => {
          const { status, data } = getDocStatus(docCfg.key);
          return (
            <DocumentUploadItem
              key={docCfg.key}
              label={docCfg.label}
              docKey={docCfg.key}
              status={status}
              data={data}
              isUploading={uploadingState[docCfg.key]}
              handleUpload={handleUpload}
              handleDelete={handleDelete}
              isEditing={isEditing}
              optional={docCfg.optional}
              verificationStatus={verificationStatus}
              docConfig={docCfg}
            />
          );
        })}
      </div>
    </>
  );
};

export default FinancialHRDocumentsSection;
