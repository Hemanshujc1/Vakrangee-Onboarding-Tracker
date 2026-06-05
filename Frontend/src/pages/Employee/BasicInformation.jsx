import React, { useState, useEffect } from "react";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import { useAlert } from "../../context/AlertContext";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { basicInfoValidationSchema, defaultBasicInfoValues, fieldToSectionMap } from "./BasicInfo/basicInfoSchema";
import { usePanVerification } from "../../hooks/usePanVerification";
import { useDocumentManager } from "../../hooks/useDocumentManager";
import { useEmployeeProfile } from "../../hooks/useEmployeeProfile";
import { formatDate, getSectionStatus, isProfileComplete } from "../../utils/basicInfoHelpers";
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

const BasicInformation = () => {
  const [expandedSection, setExpandedSection] = useState("identity");
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const { showConfirm, showAlert } = useAlert();

  const {
    documents,
    uploadingState,
    fetchDocuments,
    handleUpload,
    handleDelete,
    getDocStatus,
  } = useDocumentManager(showAlert, showConfirm);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    getValues,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(basicInfoValidationSchema),
    defaultValues: defaultBasicInfoValues,
    mode: "all",
  });

  const formData = watch();

  const {
    panVerifying,
    panVerified,
    setPanVerified,
    panVerificationFailed,
    panFormatError,
    setLastVerifiedPanData
  } = usePanVerification(formData, setValue, trigger, showAlert, isEditing);



  const {
    autoSaving,
    lastSavedData,
    setLastSavedData,
    loading,
    saving,
    submitting,
    verificationStatus,
    rejectionReason,
    verifiedByName,
    previewImage,
    previewSignature,
    fetchProfile,
    handleImageChange,
    handleSignatureChange,
    onSubmit,
    handleSubmitForVerification,
  } = useEmployeeProfile({
    reset,
    setIsEditing,
    setPanVerified,
    setLastVerifiedPanData,
    handleUpload,
    panVerified,
    setMessage,
    showConfirm,
  });

  useEffect(() => {
    fetchProfile();
    fetchDocuments();
  }, [fetchProfile, fetchDocuments]);

  const handleToggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const effectiveBasicInfoLocked = 
      verificationStatus === "SUBMITTED" || 
      verificationStatus === "VERIFIED";

  // Auto-save logic
  useEffect(() => {
    if (!isEditing || effectiveBasicInfoLocked) return;

    const delayDebounceFn = setTimeout(() => {
      // Check if data actually changed to avoid redundant saves
      const currentData = JSON.stringify(formData);
      if (lastSavedData !== currentData && lastSavedData !== null) {
        onSubmit(formData, true);
        setLastSavedData(currentData);
      } else if (lastSavedData === null) {
        setLastSavedData(currentData);
      }
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [formData, isEditing, effectiveBasicInfoLocked, lastSavedData, onSubmit, setLastSavedData]);

  const onError = (errors) => {
    console.error("Form Validation Errors:", errors);
    setMessage({
      type: "error",
      text: "Please fix the validation errors highlighting in red before saving.",
    });

    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const sectionToExpand = fieldToSectionMap[firstErrorField];
      if (sectionToExpand) {
        setExpandedSection(sectionToExpand);
        
        setTimeout(() => {
          const inputElement = document.querySelector(`[name="${firstErrorField}"]`);
          if (inputElement) {
            inputElement.focus({ preventScroll: true }); 
            const yOffset = -150; 
            const y = inputElement.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          } else {
            const sectionEl = document.getElementById(sectionToExpand);
            if (sectionEl) {
              const yOffset = -100;
              const y = sectionEl.getBoundingClientRect().top + window.scrollY + yOffset;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }
          }
        }, 300);
      }
    }
  };

  const fullAddress = [
    formData.address_line1,
    formData.address_line2,
    formData.landmark,
    formData.post_office && formData.district
      ? `${formData.post_office}, ${formData.district}`
      : formData.post_office || formData.district,
    formData.city && formData.pincode
      ? `${formData.city} - ${formData.pincode}`
      : formData.city || formData.pincode,
    formData.state && formData.country
      ? `${formData.state}, ${formData.country}`
      : formData.state || formData.country,
  ]
    .filter(Boolean)
    .join(", ");

  const _getSectionStatus = (id) => getSectionStatus(id, { formData, getDocStatus, panVerified });

  const isComplete = isProfileComplete({
    formData,
    documents,
    previewImage,
    previewSignature,
    panVerified
  });
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
              showAlert("Please fill all the required fields and upload required documents to submit.", { type: "error" });
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
               <span className="text-sm text-blue-600 font-medium">Auto-saving...</span>
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
                formatDate={formatDate}
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
                formData={formData}
                formatDate={formatDate}
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
