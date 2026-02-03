
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import axios from "axios";
import FormLayout from "../../Components/Forms/FormLayout";
import FormInput from "../../Components/Forms/FormInput";
import FormSection from "../../Components/Forms/FormSection";
import useAutoFill from "../../hooks/useAutoFill";
import { useAlert } from "../../context/AlertContext";
import { commonSchemas, createSignatureSchema } from "../../utils/validationSchemas";
import { onValidationFail } from "../../utils/formUtils";

const FormTDS = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  // Get logged-in user ID from localStorage if not in URL (which is for admins usually)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const targetId = employeeId || user.id;

  const { data: autoFillData, loading: autoFillLoading } = useAutoFill(targetId);
  const [signaturePreview, setSignaturePreview] = useState(null);

  const isLocked = ["SUBMITTED", "VERIFIED"].includes(autoFillData?.tdsStatus);
  const hasSavedSignature = !!(autoFillData?.tdsData?.signature_path || autoFillData?.signature);

  // Redirect if locked
  useEffect(() => {
     if (isLocked && autoFillData) {
         // navigate('/forms/tds-form/preview', { state: { formData: autoFillData.tdsData } });
     }
  }, [isLocked, autoFillData, navigate]);

  const validationSchema = useMemo(() => Yup.object({
     isDraft: Yup.boolean(),
     tax_regime: Yup.string().required("Please select a tax regime"),
     pan_no: commonSchemas.pan,
     contact_no: commonSchemas.mobile,
     employee_name: commonSchemas.nameString.label("Employee Name"),
     job_title: commonSchemas.stringRequired,
     
     // Numerical fields
     education_loan_amt: commonSchemas.currency,
     education_interest: commonSchemas.currency,
     housing_loan_principal: commonSchemas.currency,
     housing_loan_interest: commonSchemas.currency,
     nps_contribution: commonSchemas.currency,
     hra_rent_per_month: commonSchemas.currency,
     hra_months: Yup.number().transform((value) => (isNaN(value) ? null : value)).nullable().min(1, "Enter a Valid month").max(12, "Enter the valid month"),
     medical_total_contribution: commonSchemas.currency,
     medical_self_family: commonSchemas.currency,
     medical_parents: commonSchemas.currency,
     medical_senior_parents: commonSchemas.currency,
     life_insurance_premium: commonSchemas.currency,
     ssy_contribution: commonSchemas.currency,
     ppf_contribution: commonSchemas.currency,
     nsc_subscription: commonSchemas.currency,
     united_link_subsciption: commonSchemas.currency,
     banks_bonds: commonSchemas.currency,
     fd_bank: commonSchemas.currency,
     children_tuition_fees: commonSchemas.currency,
     mf_investment: commonSchemas.currency,
     other_investment_amt: commonSchemas.currency,
     
     // Year validation
     education_loan_start_year: Yup.string()
        .matches(/^(19|20)\d{2}$/, "Invalid Year (YYYY)")
        .test("range", "Must be between 1900 and current year", (val) => {
            if (!val) return true;
            const year = parseInt(val);
            return year >= 1900 && year <= new Date().getFullYear();
        })
        .nullable(),
     financial_year: Yup.string()
        .matches(/^\d{4}-\d{2}$/, "Invalid Financial Year (YYYY-YY)")
        .optional(),
     assessment_year: Yup.string()
        .matches(/^\d{4}-\d{2}$/, "Invalid Assessment Year (YYYY-YY)")
        .optional(),

     // Signature
     signature: Yup.mixed().when('isDraft', {
         is: true,
         then: (schema) => Yup.mixed().nullable().optional(),
         otherwise: (schema) => createSignatureSchema(hasSavedSignature)
     })
  }), [hasSavedSignature]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
        financial_year: "2024-25",
        assessment_year: "2025-26",
        tax_regime: "",
        hra_is_related_landlord: "no",
        isDraft: false,
        employee_name: "",
        job_title: "",
        pan_no: "",
        contact_no: "",
        address_line1: "",
        address_line2: "",
        landmark: "",
        city: "",
        district: "",
        state: "",
        pincode: "",
    }
  });

  const watchRelatedLandlord = watch("hra_is_related_landlord");
  const watchTaxRegime = watch("tax_regime");

  useEffect(() => {
    if (autoFillData) {
      const savedData = autoFillData.tdsData || {};
      const address = autoFillData.address || {};

      reset({
        ...savedData,
        financial_year: savedData.financial_year || "2024-25",
        assessment_year: savedData.assessment_year || "2025-26",
        tax_regime: savedData.tax_regime || "",
        
        employee_name: savedData.employee_name || autoFillData.fullName || "",
        employee_code: savedData.employee_code || autoFillData.employeeCode || "",
        
        address_line1: savedData.address_line1 || address.line1 || "",
        address_line2: savedData.address_line2 || address.line2 || "",
        landmark: savedData.landmark || address.landmark || "",
        city: savedData.city || address.city || "",
        district: savedData.district || address.district || "",
        state: savedData.state || address.state || "",
        pincode: savedData.pincode || address.pincode || "",
        
        job_title: savedData.job_title || autoFillData.designation || "",
        pan_no: savedData.pan_no || autoFillData.panNo || "",
        contact_no: savedData.contact_no || autoFillData.phone || "",

        hra_is_related_landlord: savedData.hra_is_related_landlord || "no",

        isDraft: false
      });

      if (savedData.signature_path || autoFillData.signature) {
        setSignaturePreview(
          `/uploads/signatures/${savedData.signature_path || autoFillData.signature}`
        );
      }
    }
  }, [autoFillData, reset]);

  const isPreviewRef = React.useRef(false);

  const onFormSubmit = async (values) => {
    // Disabled fields are excluded from 'values', so fetch them manually
    const allValues = {
        ...values,
        employee_name: getValues("employee_name"),
        job_title: getValues("job_title"),
        address_line1: getValues("address_line1"),
        pan_no: getValues("pan_no"),
        contact_no: getValues("contact_no"),
    };

    try {
      const formData = new FormData();
      
      Object.keys(allValues).forEach(key => {
          if (key === "signature") {
              if (allValues.signature instanceof File) {
                  formData.append("signature", allValues.signature);
              }
          } else if (key !== "signature_path") {
              formData.append(key, allValues[key] == null ? "" : allValues[key]);
          }
      });

      if (!allValues.signature && !allValues.isDraft) {
           const existingPath = autoFillData?.tdsData?.signature_path || autoFillData?.signature;
           if (existingPath) formData.append("signature_path", existingPath);
      }

      const token = localStorage.getItem("token");
      await axios.post("/api/forms/tds", formData, {
          headers: { Authorization: `Bearer ${token}` },
      });

      if (allValues.isDraft && !isPreviewRef.current) {
          await showAlert("Draft Saved!", { type: 'success' });
      } else {
          // Navigate to Preview
          const savedData = autoFillData?.tdsData || {};
          navigate(`/forms/tds-form/preview/${targetId}`, {
              state: {
                  formData: {
                    ...allValues,
                    signature_path: savedData.signature_path || autoFillData?.signature
                  },
                  signaturePreview: signaturePreview,
                  employeeId: targetId,
                  isHR: false,
                  status: "DRAFT", // Still Draft
                  fromPreviewSubmit: true
              }
          });
      }

    } catch (error) {
      console.error("Submission Error", error);
      await showAlert(`Failed to save form: ${error.response?.data?.message || error.message}`, { type: 'error' });
    }
  };

  if (autoFillLoading) return <div>Loading...</div>;

  return (
    <FormLayout
        title="TDS Declaration Form"
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
                isPreviewRef.current = false;
                handleSubmit(onFormSubmit, (e) => onValidationFail(e, showAlert))();
            },
            onSubmit: () => {
                setValue("isDraft", true); // Save as draft first
                isPreviewRef.current = true;
                handleSubmit(onFormSubmit, (e) => onValidationFail(e, showAlert))();
            }
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
                
                {/* Tax Regime */}
                <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Tax Regime</h2>
                    <div className="flex gap-8">
                         <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg shadow-sm border hover:border-blue-400 transition-colors w-full sm:w-auto">
                            <input type="radio" value="new" {...register("tax_regime")} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
                            <span className="font-medium text-gray-700">New Tax Regime</span>
                         </label>
                         <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg shadow-sm border hover:border-blue-400 transition-colors w-full sm:w-auto">
                            <input type="radio" value="old" {...register("tax_regime")} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
                            <span className="font-medium text-gray-700">Old Tax Regime</span>
                         </label>
                    </div>
                    {errors.tax_regime && <p className="text-red-500 text-sm mt-2">{errors.tax_regime.message}</p>}
                </div>

                {/* Section 1: Education Loan */}
                 <FormSection title="1. Education Loan">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="Education Loan Amount" type="number" register={register} name="education_loan_amt" error={errors.education_loan_amt} min={0} max={9999999999} />
                        <FormInput label="Start Year (Loan Taken)" placeholder="YYYY" register={register} name="education_loan_start_year" error={errors.education_loan_start_year} />
                        <FormInput label={`Interest Payable (Apr-Mar)`} type="number" register={register} name="education_interest" error={errors.education_interest} min={0} max={9999999999} />
                    </div>
                 </FormSection>

                 {/* Section 2: Housing Loan */}
                 <FormSection title="2. Housing Loan">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="Principal Amount Payable" type="number" register={register} name="housing_loan_principal" error={errors.housing_loan_principal} min={0} max={9999999999} />
                        <FormInput label="Interest Amount Payable" type="number" register={register} name="housing_loan_interest" error={errors.housing_loan_interest} min={0} max={9999999999} />
                    </div>
                 </FormSection>

                  {/* Section 3: NPS */}
                  <FormSection title="3. Contribution to National Pension Scheme (NPS)">
                     <FormInput label="Amount" type="number" register={register} name="nps_contribution" className="max-w-xs" error={errors.nps_contribution} min={0} max={9999999999} />
                  </FormSection>

                 {/* Section 4: HRA */}
                 <FormSection title="4. House Rent Allowance (HRA)">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="Rent Per Month (Rs.)" type="number" register={register} name="hra_rent_per_month" error={errors.hra_rent_per_month} min={0} max={9999999999} />
                        <FormInput label="No. of Months" type="number" register={register} name="hra_months" error={errors.hra_months} min={0} max={9999999999} />
                    </div>
                    <div className="mt-4 border-t pt-4">
                        <div className="flex gap-6 items-center flex-wrap">
                            <span className="text-sm font-medium text-gray-700">Related to Landlord?</span>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" value="yes" {...register("hra_is_related_landlord")} /> <span>Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" value="no" {...register("hra_is_related_landlord")} /> <span>No</span>
                            </label>
                        </div>
                        {watchRelatedLandlord === "yes" && (
                            <div className="mt-4">
                                <FormInput 
                                    label="Relationship with Landlord" 
                                    register={register} 
                                    name="hra_landlord_relationship" 
                                    placeholder="e.g. Father/Mother" 
                                    error={errors.hra_landlord_relationship}
                                />
                                <p className="text-xs text-red-500 mt-1">In case of Parents, Registered Agreement is compulsory.</p>
                            </div>
                        )}
                    </div>
                 </FormSection>

                 {/* Section 5: Medical Insurance */}
                 <FormSection title="5. Medical Insurance Premium">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="Contribution to Medical Insurance Premium" type="number" register={register} name="medical_total_contribution" error={errors.medical_total_contribution} min={0} max={9999999999} />
                        <FormInput label="For Self & Family" type="number" register={register} name="medical_self_family" error={errors.medical_self_family} min={0} max={9999999999} />
                        <FormInput label="For Parents" type="number" register={register} name="medical_parents" error={errors.medical_parents} min={0} max={9999999999} />
                        <FormInput label="For Senior Citizen Parents" type="number" register={register} name="medical_senior_parents" error={errors.medical_senior_parents} min={0} max={9999999999} />
                    </div>
                 </FormSection>

                 {/* Section 6-15: Other Investments */}
                 <FormSection title="Other Investments">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="Life Insurance Premium" type="number" register={register} name="life_insurance_premium" error={errors.life_insurance_premium} min={0} max={9999999999} />
                        <FormInput label="Contribution to PPF" type="number" register={register} name="ppf_contribution" error={errors.ppf_contribution} min={0} max={9999999999} />
                        <FormInput label="Contribution to SSY" type="number" register={register} name="ssy_contribution" error={errors.ssy_contribution} min={0} max={9999999999} />
                        <FormInput label="Subscription to N.S.C." type="number" register={register} name="nsc_subscription" error={errors.nsc_subscription} min={0} max={9999999999} />
                        <FormInput label="Subscription to ULIP" type="number" register={register} name="united_link_subsciption" error={errors.united_link_subsciption} min={0} max={9999999999} />
                        <FormInput label="IDBI / ICICI Bonds" type="number" register={register} name="banks_bonds" error={errors.banks_bonds} min={0} max={9999999999} />
                        <FormInput label="Fixed Deposit (> 5 Years)" type="number" register={register} name="fd_bank" error={errors.fd_bank} min={0} max={9999999999} />
                        <FormInput label="Tuition Fees (Children)" type="number" register={register} name="children_tuition_fees" error={errors.children_tuition_fees} min={0} max={9999999999} />
                        <FormInput label="Mutual Fund ELSS" type="number" register={register} name="mf_investment" error={errors.mf_investment} min={0} max={9999999999} />
                    </div>
                    <div className="mt-6 border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Any other allowable investment</label>
                        <div className="flex gap-4">
                             <div className="grow">
                                <FormInput register={register} name="other_investment_details" placeholder="Mention Details" error={errors.other_investment_details} />
                             </div>
                             <div className="w-32">
                                <FormInput type="number" register={register} name="other_investment_amt" placeholder="Amount" error={errors.other_investment_amt} min={0} max={9999999999} />
                             </div>
                        </div>
                    </div>
                 </FormSection>
                
                 {/* Declaration Text */}
                 <div className="p-4 bg-gray-50 rounded text-sm text-justify">
                    <p className="mb-2">I declare that I will contribute to the above tax saving schemes during the F.Y. {watch("financial_year") || "2024-25"}. The same may be taken for my Income Tax computation for TDS purpose.</p>
                 </div>

                {/* Confirm Details Section */}
                <FormSection title="Employee Declaration">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="Name" register={register} name="employee_name" disabled error={errors.employee_name} />
                        <FormInput label="Designation" register={register} name="job_title" disabled error={errors.job_title} />
                        <div className="md:col-span-2">
                            <FormInput label="Residence Address" register={register} name="address_line1" disabled error={errors.address_line1} />
                        </div>
                        <FormInput label="PAN No." register={register} name="pan_no" disabled error={errors.pan_no} />
                        <FormInput label="Contact No." register={register} name="contact_no" disabled error={errors.contact_no} />
                     </div>
                </FormSection>

        {/* Signature moved to Layout Footer */}
    </FormLayout>
  );

};

export default FormTDS;
