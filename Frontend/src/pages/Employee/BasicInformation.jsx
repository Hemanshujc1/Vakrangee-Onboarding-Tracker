import React from "react";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import BasicInfoHeader from "../../Components/Employee/BasicInfo/BasicInfoHeader";
import ProfilePhotoSection from "../../Components/Employee/BasicInfo/ProfilePhotoSection";
import ProfileIdentitySection from "../../Components/Employee/BasicInfo/ProfileIdentitySection";
import ContactInfoSection from "../../Components/Employee/BasicInfo/ContactInfoSection";
import JobInformationSection from "../../Components/Employee/BasicInfo/JobInformationSection";
import AddressInformationSection from "../../Components/Employee/BasicInfo/AddressInformationSection";
import AcademicDetailsSection from "../../Components/Employee/BasicInfo/AcademicDetailsSection";
import FinancialHRDocumentsSection from "../../Components/Employee/BasicInfo/FinancialHRDocumentsSection";
import SignatureSection from "../../Components/Employee/BasicInfo/SignatureSection";
import AccordionSection from "../../Components/Employee/BasicInfo/AccordionSection";
import { useBasicInformation } from "./hooks/useBasicInformation";
import { getMissingProfileFields } from "../../utils/basicInfoHelpers";

const BasicInformation = () => {
  const {
    expandedSection,
    isEditing,
    setIsEditing,
    message,
    workLocation,
    loading,
    saving,
    submitting,
    verificationStatus,
    rejectionReason,
    verifiedByName,
    documents,
    uploadingState,
    handleUpload,
    handleDelete,
    getDocStatus,
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    getValues,
    clearErrors,
    errors,
    formData,
    panVerifying,
    panVerified,
    panVerificationFailed,
    panFormatError,
    autoSaving,
    previewImage,
    previewSignature,
    handleImageChange,
    handleSignatureChange,
    onSubmit,
    handleSubmitForVerification,
    handleToggleSection,
    effectiveBasicInfoLocked,
    onError,
    fullAddress,
    _getSectionStatus,
    isComplete,
    fetchProfile,
    showAlert,
  } = useBasicInformation();

  if (loading)
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading information...</div>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
        <BasicInfoHeader
          verificationStatus={verificationStatus}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          onCancel={() => {
            setIsEditing(false);
            fetchProfile();
          }}
          onSubmitVerification={handleSubmitForVerification}
          onSubmitLoading={submitting}
          saving={saving}
          verifiedByName={verifiedByName}
          rejectionReason={rejectionReason}
          isProfileComplete={isComplete}
          documents={documents}
          onSave={() => {
            clearErrors();
            onSubmit(getValues());
          }}
          onTrySubmitIncomplete={() => {
            setIsEditing(true);
            setTimeout(() => {
              trigger();
              
              const missingData = getMissingProfileFields({
                formData,
                documents,
                previewImage,
                previewSignature,
                panVerified,
              });

              if (missingData.length > 0) {
                const messageNode = (
                  <div className="text-sm text-left">
                    <p className="font-semibold mb-2">Please complete the following missing items to submit:</p>
                    <ul className="list-disc pl-5 space-y-2 max-h-[60vh] overflow-y-auto">
                      {missingData.map((section, idx) => (
                        <li key={idx}>
                          <span className="font-semibold text-gray-800">{section.section}:</span>
                          <span className="ml-1 text-gray-600">{section.items.join(", ")}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
                showAlert(messageNode, { type: "error", title: "Incomplete Profile" });
              } else {
                showAlert(
                  "Please fill all the required fields and upload required documents to submit.",
                  { type: "error" }
                );
              }
            }, 100);
          }}
        />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8">
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {autoSaving && (
            <div className="fixed bottom-6 right-6 bg-white shadow-lg border border-blue-100 px-4 py-2 rounded-full flex items-center gap-2 animate-pulse z-50">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <span className="text-sm text-blue-600 font-medium">
                Auto-saving...
              </span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <ProfilePhotoSection
              previewImage={previewImage}
              isEditing={isEditing}
              handleImageChange={handleImageChange}
              isLocked={effectiveBasicInfoLocked}
              photoStatus={getDocStatus("Passport Size Photo")}
            />

            <AccordionSection
              id="identity"
              title="Personal Details & Identity"
              isOpen={expandedSection === "identity"}
              onToggle={handleToggleSection}
              isCompleted={_getSectionStatus("identity")}
            >
              <ProfileIdentitySection
                register={register}
                errors={errors}
                isEditing={isEditing}
                formData={formData}
                getDocStatus={getDocStatus}
                uploadingState={uploadingState}
                handleUpload={handleUpload}
                handleDelete={handleDelete}
                panVerifying={panVerifying}
                panVerified={panVerified}
                panVerificationFailed={panVerificationFailed}
                panFormatError={panFormatError}
                verificationStatus={verificationStatus}
                isLocked={effectiveBasicInfoLocked}
              />
            </AccordionSection>

            <AccordionSection
              id="job"
              title="Job Information"
              isOpen={expandedSection === "job"}
              onToggle={handleToggleSection}
              isCompleted={_getSectionStatus("job")}
            >
              <JobInformationSection
                register={register}
                formData={{ ...formData, work_location: workLocation }}
                verificationStatus={verificationStatus}
              />
            </AccordionSection>

            <AccordionSection
              id="contact"
              title="Contact Information"
              isOpen={expandedSection === "contact"}
              onToggle={handleToggleSection}
              isCompleted={_getSectionStatus("contact")}
            >
              <ContactInfoSection
                register={register}
                errors={errors}
                isEditing={isEditing}
                formData={formData}
                verificationStatus={verificationStatus}
                isLocked={effectiveBasicInfoLocked}
                setValue={setValue}
              />
            </AccordionSection>

            <AccordionSection
              id="address"
              title="Address Information"
              isOpen={expandedSection === "address"}
              onToggle={handleToggleSection}
              isCompleted={_getSectionStatus("address")}
            >
              <AddressInformationSection
                register={register}
                errors={errors}
                isEditing={isEditing}
                fullAddress={fullAddress}
                setValue={setValue}
                watch={watch}
                trigger={trigger}
                verificationStatus={verificationStatus}
                isLocked={effectiveBasicInfoLocked}
              />
            </AccordionSection>

            <AccordionSection
              id="academic"
              title="Academic Details"
              isOpen={expandedSection === "academic"}
              onToggle={handleToggleSection}
              isCompleted={_getSectionStatus("academic")}
            >
              <AcademicDetailsSection
                register={register}
                errors={errors}
                isEditing={isEditing}
                formData={formData}
                getDocStatus={getDocStatus}
                uploadingState={uploadingState}
                handleUpload={handleUpload}
                handleDelete={handleDelete}
                verificationStatus={verificationStatus}
                isLocked={effectiveBasicInfoLocked}
                setValue={setValue}
              />
            </AccordionSection>

            <AccordionSection
              id="financial"
              title="Financial & HR Documents"
              isOpen={expandedSection === "financial"}
              onToggle={handleToggleSection}
              isCompleted={_getSectionStatus("financial")}
            >
              <FinancialHRDocumentsSection
                isEditing={isEditing}
                getDocStatus={getDocStatus}
                uploadingState={uploadingState}
                handleUpload={handleUpload}
                handleDelete={handleDelete}
                verificationStatus={verificationStatus}
                isLocked={effectiveBasicInfoLocked}
              />
            </AccordionSection>

            <AccordionSection
              id="signature"
              title="Signature"
              isOpen={expandedSection === "signature"}
              onToggle={handleToggleSection}
              isCompleted={_getSectionStatus("signature")}
            >
              <SignatureSection
                previewSignature={previewSignature}
                isEditing={isEditing}
                handleSignatureChange={handleSignatureChange}
                verificationStatus={verificationStatus}
                isLocked={effectiveBasicInfoLocked}
                signatureStatus={getDocStatus("Signature")}
              />
            </AccordionSection>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default BasicInformation;
