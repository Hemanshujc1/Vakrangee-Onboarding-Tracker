import React from "react";
import DocumentUploadItem from "./DocumentUploadItem";

const FinancialHRDocumentsSection = ({
  isEditing,
  getDocStatus,
  uploadingState,
  handleUpload,
  handleDelete,
  isLocked,
  verificationStatus,
}) => {
  const chequeDoc = getDocStatus("Cancelled Cheque");
  const relievingDoc = getDocStatus("Relieving Letter");
  const experienceDoc = getDocStatus("Experience Certificate");
  const serviceDoc = getDocStatus("Service Certificates");
  const salaryDoc = getDocStatus("Last Drawn Salary Slip");

  return (
    <>
      <div className="mt-6">
        <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
          Financial & HR Documents
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:col-span-2">
        <DocumentUploadItem
          label="Cancelled Cheque"
          docKey="Cancelled Cheque"
          status={chequeDoc.status}
          data={chequeDoc.data}
          isUploading={uploadingState["Cancelled Cheque"]}
          handleUpload={handleUpload}
          handleDelete={handleDelete}
          isEditing={isEditing}
          verificationStatus={verificationStatus}
        />

        <DocumentUploadItem
          label="Relieving Letter"
          docKey="Relieving Letter"
          status={relievingDoc.status}
          data={relievingDoc.data}
          isUploading={uploadingState["Relieving Letter"]}
          handleUpload={handleUpload}
          handleDelete={handleDelete}
          isEditing={isEditing}
          optional={true}
          verificationStatus={verificationStatus}
        />

        <DocumentUploadItem
          label="Experience Certificate"
          docKey="Experience Certificate"
          status={experienceDoc.status}
          data={experienceDoc.data}
          isUploading={uploadingState["Experience Certificate"]}
          handleUpload={handleUpload}
          handleDelete={handleDelete}
          isEditing={isEditing}
          optional={true}
          verificationStatus={verificationStatus}
        />

        <DocumentUploadItem
          label="Service Certificates"
          docKey="Service Certificates"
          status={serviceDoc.status}
          data={serviceDoc.data}
          isUploading={uploadingState["Service Certificates"]}
          handleUpload={handleUpload}
          handleDelete={handleDelete}
          isEditing={isEditing}
          optional={true}
          verificationStatus={verificationStatus}
        />

        <DocumentUploadItem
          label="Last Drawn Salary Slip"
          docKey="Last Drawn Salary Slip"
          status={salaryDoc.status}
          data={salaryDoc.data}
          isUploading={uploadingState["Last Drawn Salary Slip"]}
          handleUpload={handleUpload}
          handleDelete={handleDelete}
          isEditing={isEditing}
          optional={true}
          verificationStatus={verificationStatus}
        />
      </div>
    </>
  );
};

export default FinancialHRDocumentsSection;
