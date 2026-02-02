import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Trash2 } from "lucide-react";
import FormLayout from "../../Components/Forms/FormLayout";
import FormInput from "../../Components/Forms/FormInput";
import FormSelect from "../../Components/Forms/FormSelect";
import FormSection from "../../Components/Forms/FormSection";
import useAutoFill from "../../hooks/useAutoFill";
import { useAlert } from "../../context/AlertContext";
import { InstructionBlock, DynamicTable, TableInput, AddButton } from "../../Components/Forms/Shared";
import { onValidationFail, formatDateForAPI } from "../../utils/formUtils";
import { commonSchemas, createSignatureSchema } from "../../utils/validationSchemas";

const MAX_FILE_SIZE = 200 * 1024; // 200KB

const defaultValues = {
  employee_full_name: "",
  date_of_birth: "",
  gender: "",
  marital_status: "",
  mobile_number: "",
  address_line1: "",
  address_line2: "",
  landmark: "",
  post_office: "",
  city: "",
  district: "",
  state: "",
  pincode: "",
  employee_code: "",
  dependents: [{ relationship: "Spouse", name: "", age: "", dob: "" }],
  signature: undefined, // Changed from null
  isDraft: false,
};

const FormMediclaim = () => {
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
  const isLocked = ['SUBMITTED', 'VERIFIED'].includes(autoFillData?.mediclaimStatus);

  // Determine if a signature is already saved on the server
  const hasSavedSignature = !!(autoFillData?.mediclaimData?.signature_path || autoFillData?.signature);

  // Redirect if locked (Optional: or show read-only view)
  useEffect(() => {
     if (isLocked) {
         // Could redirect to preview or show alert
         // navigate('/forms/mediclaim/preview', { state: { formData: autoFillData.mediclaimData } });
     }
  }, [isLocked, autoFillData, navigate]);

  const validationSchema = React.useMemo(() => Yup.object({
    employee_full_name: commonSchemas.nameString.label("Full Name"),
    date_of_birth: commonSchemas.dateRequired,
    gender: commonSchemas.stringRequired,
    marital_status: commonSchemas.stringRequired,
    mobile_number: commonSchemas.mobile,
    address_line1: commonSchemas.addressString.label("Address Line 1"),
    address_line2: commonSchemas.addressString.label("Address Line 2"),
    landmark: commonSchemas.landmark,
    post_office: commonSchemas.stringRequired,
    city: commonSchemas.stringRequired,
    state: commonSchemas.stringRequired,
    pincode: commonSchemas.pincode,
    dependents: Yup.array().when("marital_status", {
      is: "Married",
      then: (schema) =>
        schema.of(
          Yup.object().shape({
            name: commonSchemas.nameString.label("Name"),
            relationship: commonSchemas.stringRequired,
            age: commonSchemas.age.required("Required"),
            dob: commonSchemas.datePast.required("DOB is required"),
          })
        ),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
    signature: createSignatureSchema(hasSavedSignature),
  }), [hasSavedSignature]);

   const validationSchemaRef = React.useRef(validationSchema);
  useEffect(() => {
    validationSchemaRef.current = validationSchema;
  }, [validationSchema]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    trigger, // Added trigger
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: React.useCallback(async (values, context, options) => {
        const resolver = yupResolver(validationSchemaRef.current);
        return resolver(values, context, options);
    }, []),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "dependents",
  });

  const maritalStatus = watch("marital_status");

  useEffect(() => {
    if (autoFillData) {
      const savedData = autoFillData.mediclaimData || {};
      const address = autoFillData.address || {};

      reset({
        employee_full_name:
          savedData.employee_full_name || autoFillData.fullName || "",
        date_of_birth:
          savedData.date_of_birth || autoFillData.dateOfBirth || "",
        gender: savedData.gender || autoFillData.gender || "",
        mobile_number: savedData.mobile_number || autoFillData.phone || "",
        employee_code:
          savedData.employee_code || autoFillData.employeeCode || "",

        address_line1: savedData.address_line1 || address.line1 || "",
        address_line2: savedData.address_line2 || address.line2 || "",
        landmark: savedData.landmark || address.landmark || "",
        post_office: savedData.post_office || address.post_office || "",
        city: savedData.city || address.city || "",
        district: savedData.district || address.district || "",
        state: savedData.state || address.state || "",

        pincode: savedData.pincode || address.pincode || "",

        marital_status: savedData.marital_status || "",
        dependents: savedData.dependents
          ? typeof savedData.dependents === "string"
            ? JSON.parse(savedData.dependents)
            : savedData.dependents
          : defaultValues.dependents,

        signature: undefined, // Changed from null to undefined
        isDraft: false,
      });

      const existingSignature = savedData.signature_path || autoFillData.signature;
      if (existingSignature) {
        setSignaturePreview(
          `http://localhost:3001/uploads/signatures/${existingSignature}`
        );
      }
    }
  }, [autoFillData, reset]);

  const onFormSubmit = async (values) => {
    // If it's a draft, save via API immediately
    if (values.isDraft) {
        try {
            const formData = new FormData();
            Object.keys(values).forEach((key) => {
                if (key === "dependents") {
                    // Dependents logic for draft
                    const dependents = values.marital_status === "Married" ? values.dependents : null;
                    let formattedDependents = null;
                     if (dependents && Array.isArray(dependents)) {
                        formattedDependents = dependents.map(d => ({
                           ...d,
                           dob: d.dob ? new Date(d.dob).toISOString().split('T')[0] : ""
                        }));
                     }
                    formData.append("dependents", JSON.stringify(formattedDependents || []));
                } else if (key === "signature") {
                    if (values.signature instanceof File) {
                        formData.append("signature", values.signature);
                    }
                } else if (key === "date_of_birth") {
                     formData.append(key, formatDateForAPI(values[key]));
                } else {
                    formData.append(key, values[key] || "");
                }
            });

            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3001/api/forms/mediclaim", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (response.ok) {
                await showAlert("Draft Saved!", { type: 'success' });
            } else {
                const errorData = await response.json().catch(() => ({}));
                await showAlert(`Error: ${errorData.message || response.statusText}`, { type: 'error' });
            }
        } catch (error) {
            console.error("Submission Error", error);
            await showAlert("Failed to connect to server.", { type: 'error' });
        }
    } else {
        const savedData = autoFillData?.mediclaimData || {};
        navigate("/forms/mediclaim/preview", {
            state: {
                formData: {
                  ...values,
                  signature_path: savedData.signature_path || autoFillData?.signature
                },
                signaturePreview: signaturePreview,
                employeeId: employeeId,
                isHR: false // Assuming default flow is employee side? Or derive from user/mode
            }
        });
    }
  };

  if (loading) return <div>Loading Form Data...</div>;

    return (
    <FormLayout
        title="Mediclaim Information Form"
        employeeData={{
            ...autoFillData,
            signature: autoFillData?.mediclaimData?.signature_path || autoFillData?.signature
        }}
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
      
      <InstructionBlock />
        {/* 1. Employee Details Section */}
        <FormSection title="Employee Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput 
              label="Full Name" 
              register={register} 
              name="employee_full_name" 
              error={errors.employee_full_name} 
              disabled={!!autoFillData?.fullName}
              required={true}
            />
            
            <div className="hidden">
              <input {...register("employee_code")} type="hidden" />
            </div>

            <FormInput 
              label="Date of Birth" 
              type="date" 
              register={register} 
              name="date_of_birth" 
              error={errors.date_of_birth} 
              disabled={!!autoFillData?.dateOfBirth}
              required={true}
            />
            
            <FormSelect 
                label="Gender" 
                register={register} 
                name="gender" 
                options={["Male", "Female", "Other"]} 
                error={errors.gender} 
                disabled={!!autoFillData?.gender}
                required={true}
            />
            
            <FormSelect 
                label="Marital Status" 
                register={register} 
                name="marital_status" 
                options={["Married", "Unmarried"]} 
                error={errors.marital_status} 
                required={true}
            />

            <FormInput 
              label="Mobile No" 
              register={register} 
              name="mobile_number" 
              error={errors.mobile_number} 
              disabled={!!autoFillData?.phone}
              required={true}
            />
          </div>
        </FormSection>

        {/* 2. Address Section */}
        <FormSection title="Address">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormInput label="Address Line 1" register={register} name="address_line1" error={errors.address_line1} required={true} />
            </div>
            <div className="md:col-span-2">
              <FormInput label="Address Line 2" register={register} name="address_line2" required={true} />
            </div>
            <FormInput label="Landmark" register={register} name="landmark" />
            <FormInput label="Post Office" register={register} name="post_office" error={errors.post_office} required={true} />
            <FormInput label="City" register={register} name="city" error={errors.city} required={true} />
            <FormInput label="District" register={register} name="district" />
            <FormInput label="State" register={register} name="state" error={errors.state} required={true} />
            <FormInput label="Pincode" register={register} name="pincode" error={errors.pincode} required={true} />
          </div>
        </FormSection>

        {/* 3. Family Details Section (Dynamic) - Only if Married */}
        {maritalStatus === "Married" && (
          <FormSection title="Family Details / Dependents">
            <DynamicTable
                headers={["Relationship", "Name", "Age", "DOB"]}
                fields={fields}
                onRemove={remove}
                renderRow={(item, index) => (
                    <>
                        <td className="border border-gray-300 p-1 align-top">
                            <select
                                {...register(`dependents.${index}.relationship`)}
                                className="w-full outline-none p-1 bg-transparent"
                            >
                                <option value="Spouse">Spouse</option>
                                <option value="Child">Child</option>
                                <option value="Mother">Mother</option>
                                <option value="Father">Father</option>
                            </select>
                             {errors.dependents?.[index]?.relationship && (
                                <span className="text-red-500 text-xs block px-1">{errors.dependents[index].relationship.message}</span>
                            )}
                        </td>
                        <TableInput
                            register={register(`dependents.${index}.name`)}
                            error={errors.dependents?.[index]?.name}
                            placeholder="Name"
                            required
                        />
                        <TableInput
                            type="number"
                            register={register(`dependents.${index}.age`)}
                            error={errors.dependents?.[index]?.age}
                            placeholder="Age"
                            required
                        />
                        <TableInput
                            type="date"
                            register={register(`dependents.${index}.dob`)}
                            error={errors.dependents?.[index]?.dob}
                            required
                        />
                    </>
                )}
            />
            
            <div className="mt-2 flex justify-end">
                <AddButton onClick={() => append({ relationship: "Spouse", name: "", age: "", dob: "" })} label="Add Dependent" />
            </div>
          </FormSection>
        )}

    </FormLayout>
  );
};

export default FormMediclaim;
