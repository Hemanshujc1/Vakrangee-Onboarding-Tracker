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

  const bankStatementsDoc = getDocStatus("6 Months Bank Statement");
  const offerLetter1Doc = getDocStatus("Previous Offer Letter 1");
  const offerLetter2Doc = getDocStatus("Previous Offer Letter 2");
  const resumeDoc = getDocStatus("Resume");

  return (
    <>
      <div className="mt-6 mb-6">
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
          label="6 Months Bank Statement"
          docKey="6 Months Bank Statement"
          status={bankStatementsDoc.status}
          data={bankStatementsDoc.data}
          isUploading={uploadingState["6 Months Bank Statement"]}
          handleUpload={handleUpload}
          handleDelete={handleDelete}
          isEditing={isEditing}
          verificationStatus={verificationStatus}
        />

        <DocumentUploadItem
          label="Previous Offer Letter 1"
          docKey="Previous Offer Letter 1"
          status={offerLetter1Doc.status}
          data={offerLetter1Doc.data}
          isUploading={uploadingState["Previous Offer Letter 1"]}
          handleUpload={handleUpload}
          handleDelete={handleDelete}
          isEditing={isEditing}
          verificationStatus={verificationStatus}
        />

        <DocumentUploadItem
          label="Previous Offer Letter 2"
          docKey="Previous Offer Letter 2"
          status={offerLetter2Doc.status}
          data={offerLetter2Doc.data}
          isUploading={uploadingState["Previous Offer Letter 2"]}
          handleUpload={handleUpload}
          handleDelete={handleDelete}
          isEditing={isEditing}
          optional={true}
          verificationStatus={verificationStatus}
        />

        <DocumentUploadItem
          label="Resume"
          docKey="Resume"
          status={resumeDoc.status}
          data={resumeDoc.data}
          isUploading={uploadingState["Resume"]}
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
