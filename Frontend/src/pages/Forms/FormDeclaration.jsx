 
import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import axios from "axios";

import FormLayout from "../../Components/Forms/FormLayout";
import FormInput from "../../Components/Forms/FormInput";
import useAutoFill from "../../hooks/useAutoFill";
import { useAlert } from "../../context/AlertContext";
import { commonSchemas, createSignatureSchema } from "../../utils/validationSchemas";
import { onValidationFail } from "../../utils/formUtils";

const MAX_FILE_SIZE = 200 * 1024; // 200KB

const defaultValues = {
  title: "Mr.",
  employee_full_name: "",
  employee_code: "",
  previous_company_name: "",
  previous_job_title: "",
  current_job_title: "",          
  signature: undefined,
  isDraft: false,
};

const FormDeclaration = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  // Get logged-in user ID from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const employeeId = user.id;

  useEffect(() => {
    if (!employeeId) {
      navigate("/login");
    }
  }, [employeeId, navigate]);

  const { data: autoFillData, loading } = useAutoFill(employeeId);
  const [signaturePreview, setSignaturePreview] = useState(null);

  // Determine if form is locked (Submitted or Verified)
  const isLocked = ["SUBMITTED", "VERIFIED"].includes(
    autoFillData?.declarationStatus
  );

  // Determine if a signature is already saved on the server
  const hasSavedSignature = !!(autoFillData?.declarationData?.signature_path || autoFillData?.signature);

  // Redirect if locked
  useEffect(() => {
    if (isLocked && autoFillData?.declarationData) {
       const savedData = autoFillData.declarationData;
       const signatureUrl = savedData.signature_path 
          ? `http://localhost:3001/uploads/signatures/${savedData.signature_path}`
          : null;

       navigate('/forms/declaration-form/preview', { 
         state: { 
           formData: savedData,
           signaturePreview: signatureUrl
         } 
       });
    }
  }, [isLocked, autoFillData, navigate]);

  // Validation Schema
  const validationSchema = useMemo(
    () =>
      Yup.object({
        isDraft: Yup.boolean(),
        title: Yup.string().required("Required"),
        employee_full_name: commonSchemas.nameString.label("Full Name"),
        previous_company_name: commonSchemas.stringRequired.label("Company Name"),
        previous_job_title: commonSchemas.stringRequired.label("Designation"),
        current_job_title: commonSchemas.stringRequired.label("Current Designation"),
        signature: Yup.mixed().when('isDraft', {
            is: true,
            then: (schema) => Yup.mixed().nullable().optional(),
            otherwise: (schema) => createSignatureSchema(hasSavedSignature)
        }),
      }),
    [hasSavedSignature]
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: "Mr.",
      employee_full_name: "",
      employee_code: "",
      previous_company_name: "",
      previous_job_title: "",
      current_job_title: "",          
      signature: undefined,
      isDraft: false,
    },
  });

  useEffect(() => {
    if (autoFillData) {
      const savedData = autoFillData.declarationData || {};

      reset({
        title: savedData.title || (autoFillData.gender === "Female" ? "Ms." : "Mr."),
        employee_full_name: savedData.employee_full_name || autoFillData.fullName || "",
        previous_company_name: savedData.previous_company_name || "",
        previous_job_title: savedData.previous_job_title || "",
        current_job_title: savedData.current_job_title || autoFillData.designation || "",
        signature: undefined, 
        isDraft: false,
      });

      if (savedData.signature_path || autoFillData.signature) {
        setSignaturePreview(
          `http://localhost:3001/uploads/signatures/${savedData.signature_path || autoFillData.signature}`
        );
      }
    }
  }, [autoFillData, reset]);

  const onFormSubmit = async (values) => {
    // Disabled fields are excluded from 'values', so fetch them manually
    const allValues = {
        ...values,
        employee_full_name: getValues("employee_full_name"),
        current_job_title: getValues("current_job_title"),
    };

    try {
      const formData = new FormData();
        
      Object.keys(allValues).forEach((key) => {
        if (key === "signature") {
          if (allValues.signature instanceof File) {
              formData.append("signature", allValues.signature);
          }
        } else if (key !== "signature_path") {
             formData.append(key, allValues[key] == null ? "" : allValues[key]);
        }
      });
      
      if (!allValues.signature && !allValues.isDraft) {
           const existingPath = autoFillData?.declarationData?.signature_path || autoFillData?.signature;
           if(existingPath) formData.append("signature_path", existingPath);
      }

      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3001/api/forms/declaration", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (allValues.isDraft) {
        await showAlert("Draft Saved!", { type: 'success' });
      } else {
         const savedData = autoFillData?.declarationData || {};
         navigate("/forms/declaration-form/preview", {
            state: {
              formData: {
                ...allValues,
                signature_path: savedData.signature_path || autoFillData?.signature
              },
              signaturePreview: signaturePreview,
              employeeId: employeeId,
              isHR: false
            },
         });
      }

    } catch (error) {
      console.error("Submission Error", error);
      await showAlert(`Failed to submit: ${error.response?.data?.message || error.message}`, { type: 'error' });
    }
  };

  if (loading) return <div>Loading Form Data...</div>;

    return (
    <FormLayout
        title="SELF-DECLARATION FORM"
        employeeData={autoFillData}
        showPhoto={false}
        showSignature={true}
        signaturePreview={signaturePreview}
        isLocked={isLocked}
        onSubmit={handleSubmit(onFormSubmit, (e) => onValidationFail(e, showAlert))}
        actions={{
            isSubmitting,
            onSaveDraft: () => {
                setValue("isDraft", true);
                handleSubmit(onFormSubmit, (e) => onValidationFail(e, showAlert))();
            },
            onSubmit: () => setValue("isDraft", false)
        }}
        signature={{
            setValue,
            error: errors.signature,
            preview: signaturePreview,
            setPreview: setSignaturePreview,
            isSaved: hasSavedSignature,
            fieldName: "signature"
        }}
    >
       {/* Content */}
          <div className="bg-white border-b border-gray-300 p-4 mb-6 text-sm text-gray-800">
            <div className="flex flex-col gap-2">
              <div className="font-serif tracking-wide text-gray-900 mb-2 pb-1 border-b border-gray-200 leading-loose">
                I, the undersigned
                <select
                    {...register("title")}
                    className={`mx-2 border-b border-gray-400 focus:border-gray-600 outline-none p-1 bg-transparent ${errors.title ? 'border-red-500' : ''}`}
                >
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                </select>
                (Full Name):    
                <input
                      {...register("employee_full_name")}
                      className={`w-full sm:w-1/2 ml-2 border-b border-gray-400 focus:border-gray-600 outline-none p-1 transition-colors bg-transparent disabled:bg-gray-50 ${errors.employee_full_name ? 'border-red-500' : ''}`}
                      placeholder="Enter Full Name"
                      disabled
                    />
                    {errors.employee_full_name && (
                      <p className="text-red-500 text-xs mt-1 ml-4 inline-block">
                        {errors.employee_full_name.message}
                      </p>
                    )} hereby declare that I have resigned from my previous employment i.e. Company Name: 
                    <input
                      {...register("previous_company_name")}
                      placeholder="Previous Company Name"
                      className={`w-full sm:w-1/3 ml-2 border-b border-gray-400 focus:border-gray-600 outline-none p-1 inline-block my-1 bg-transparent ${errors.previous_company_name ? 'border-red-500' : ''}`}
                    />
                    {errors.previous_company_name && (
                      <span className="text-red-500 text-xs ml-2 inline-block">
                        {errors.previous_company_name.message}
                      </span>
                    )}
                     Designation: 
                    <input
                      {...register("previous_job_title")}
                      placeholder="Previous Designation"
                      className={`w-full sm:w-1/4 ml-2 border-b border-gray-400 focus:border-gray-600 outline-none p-1 inline-block my-1 bg-transparent ${errors.previous_job_title ? 'border-red-500' : ''}`}
                    />
                    {errors.previous_job_title && (
                      <span className="text-red-500 text-xs ml-2 inline-block">
                        {errors.previous_job_title.message}
                      </span>
                    )}
                     and completed all full and final processes before joining Vakrangee Limited.
              </div>
              <p className="mt-2 text-justify leading-relaxed">I say that I do not have any outstanding dues or pending assignments of whatsoever nature in
              my previous employment.</p>
              <p className="mt-2 text-justify leading-relaxed">I say that I take complete responsibility for any issue / liability arising out of my previous
              employment and Vakrangee Limited, shall not have any responsibility whatsoever in such
              matters.</p>
            </div>
            
            <div className="mt-6 border-t border-gray-200 pt-4">
                <FormInput
                  label="Current Designation"
                  register={register}
                  name="current_job_title"
                  placeholder="Enter Current Designation"
                  disabled
                  error={errors.current_job_title}
                  required
                />
            </div>
          </div>

    </FormLayout>
  );
};

export default FormDeclaration;

