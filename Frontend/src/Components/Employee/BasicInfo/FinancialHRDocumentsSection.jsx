import React from "react";
import DocumentUploadItem from "./DocumentUploadItem";

const FinancialHRDocumentsSection = ({
  isEditing,
  getDocStatus,
  uploadingState,
  handleUpload,
  handleDelete,
}) => {
  const chequeDoc = getDocStatus("Cancelled Cheque");
  const relievingDoc = getDocStatus("Relieving Letter");
  const experienceDoc = getDocStatus("Experience Certificate");
  const serviceDoc = getDocStatus("Service Certificates");
  const salaryDoc = getDocStatus("Last Drawn Salary Slip");

  return (
    <>
      <div className="md:col-span-2 mt-8">
        <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
          Financial & HR Documents
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:col-span-2">
        <DocumentUploadItem
          label="Cancelled Cheque"
          docKey="Cancelled Cheque"
          status={chequeDoc.status}
          data={chequeDoc.data}
          isUploading={uploadingState["Cancelled Cheque"]}
          handleUpload={handleUpload}
          handleDelete={handleDelete}
          isEditing={isEditing}
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
        />
      </div>
    </>
  );
};

export default FinancialHRDocumentsSection;
