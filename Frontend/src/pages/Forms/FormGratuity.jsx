import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import FormLayout from "../../Components/Forms/FormLayout";
import FormInput from "../../Components/Forms/FormInput";
import FormSelect from "../../Components/Forms/FormSelect";
import useAutoFill from "../../hooks/useAutoFill";
import { useAlert } from "../../context/AlertContext";
import {
  DynamicTable,
  TableInput,
  AddButton,
} from "../../Components/Forms/Shared";
import { onValidationFail, formatDateForAPI } from "../../utils/formUtils";
import { commonSchemas, createSignatureSchema } from "../../utils/validationSchemas";

const FormGratuity = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const employeeId = user.id;

  useEffect(() => {
    if (!employeeId) navigate("/login");
  }, [employeeId, navigate]);

  const { data: autoFillData, loading } = useAutoFill(employeeId);
  const [signaturePreview, setSignaturePreview] = useState(null);

  // Determine if form is locked
  const isLocked = ["SUBMITTED", "VERIFIED"].includes(
    autoFillData?.gratuityStatus
  );
  const hasSavedSignature = !!(
    autoFillData?.gratuityData?.signature_path || autoFillData?.signature
  );

  // Redirect if locked
  useEffect(() => {
    if (isLocked && autoFillData) {
      navigate("/forms/gratuity-form/preview", {
        state: {
          formData: {
            ...autoFillData.gratuityData,
            employee_full_name:
              autoFillData.gratuityData?.employee_full_name ||
              autoFillData.fullName,
          },
          signaturePreview: autoFillData.gratuityData?.signature_path
            ? `http://localhost:3001/uploads/signatures/${autoFillData.gratuityData.signature_path}`
            : null,
        },
      });
    }
  }, [isLocked, autoFillData, navigate]);

  const validationSchema = React.useMemo(() => Yup.object({
    isDraft: Yup.boolean(),
    // Personal
    firstname: commonSchemas.nameString,
    lastname: commonSchemas.nameString,
    middlename: Yup.string().optional(),
    
    // Details
    religion: commonSchemas.stringRequired,
    marital_status: commonSchemas.stringRequired,
    gender: commonSchemas.stringRequired,
    department: commonSchemas.stringRequired,
    ticket_no: Yup.string() 
    .optional(), 
    date_of_appointment: Yup.string().nullable().optional(),
    
    // Address
    city: commonSchemas.stringRequired,
    thana: commonSchemas.stringRequired,
    sub_division: Yup.string().optional(),
    post_office: commonSchemas.stringRequired,
    district: commonSchemas.stringRequired,
    state: commonSchemas.stringRequired,
    place: commonSchemas.stringRequired,

    nominees: Yup.array().of(
      Yup.object().shape({
        name: commonSchemas.nameString,
        address: Yup.string().min(3, "Minimum 3 characters required")
        .max(200, "Maximum 200 characters are allowed").required("Required"),
        relationship: commonSchemas.stringRequired,
       age: Yup.number()
                   .min(0,"Minium age value is 0")
                   .max(120,"Max Age value can't exceed 120")
                   .typeError("Age must be a number")
                   .positive().integer().required("Required"),
        share: Yup.number()
         .min(0,"Minium age value is 0")
         .max(100,"Max Age value can't exceed 10")
         .typeError("Must be a number")
         .positive().integer().required("Required"),
      })
    ),

    // Witnesses - New Array Structure
    witnesses: Yup.array().of(
        Yup.object().shape({
            name: commonSchemas.nameString,
            address: Yup.string()
            .min(3, "Minimum 3 characters required")
            .max(200, "Maximum 200 characters are allowed")
            .required("Required"),
        })
    ),
    
    witnesses_place: Yup.string().when('isDraft', {
        is: false,
        then: (schema) => schema.required("Required"),
        otherwise: (schema) => schema.optional()
    }),
    witnesses_date: Yup.string().max(new Date(), "Date cannot be in the future").when('isDraft', {
        is: false,
        then: (schema) => schema.required("Required"),
        otherwise: (schema) => schema.optional()
    }),
    
    signature: Yup.mixed().when('isDraft', {
       is: true,
       then: (schema) => Yup.mixed().nullable().optional(),
       otherwise: (schema) => createSignatureSchema(hasSavedSignature)
    }),
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
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: React.useCallback(async (values, context, options) => {
        const resolver = yupResolver(validationSchemaRef.current);
        return resolver(values, context, options);
    }, []),
    defaultValues: {
      firstname: "",
      lastname: "",
      middlename: "",
      
      religion: "",
      marital_status: "",
      gender: "",
      department: "",
      ticket_no: "",
      date_of_appointment: "",
      
      city: "",
      thana: "",
      sub_division: "",
      post_office: "",
      district: "",
      state: "",
      place: "",
      
      nominees: [
        { name: "", address: "", relationship: "", age: "", share: "" },
      ],
      
      witnesses: [
          { name: "", address: "" },
          { name: "", address: "" }
      ],
      
      witnesses_place: "",
      witnesses_date: "",

      signature: undefined,
      isDraft: false,
    },
  });

  const { fields: nomineeFields, append: appendNominee, remove: removeNominee } = useFieldArray({
    control,
    name: "nominees",
  });
  
  const { fields: witnessFields } = useFieldArray({
      control,
      name: "witnesses"
  });

  useEffect(() => {
    if (autoFillData) {
      const savedData = autoFillData.gratuityData || {};
      const appData = autoFillData.applicationData || {};
      
      // Extract common witness place/date from first witness if available
      const wPlace = savedData.witnesses?.[0]?.place || "";
      const wDate = savedData.witnesses?.[0]?.date || "";

      reset({
        firstname: savedData.firstname || "",
        lastname: savedData.lastname || "",
        middlename: savedData.middlename || "",
        
        religion: savedData.religion || appData.religion || "",
        marital_status: savedData.marital_status || autoFillData.maritalStatus || "Unmarried",
        gender: savedData.gender || "",
        department: savedData.department || "",
        ticket_no: savedData.ticket_no ||"",
        date_of_appointment: formatDateForAPI(savedData.date_of_appointment) || "",

        city: savedData.city ||  autoFillData.address?.city || "",
        thana: savedData.thana || "",
        sub_division: savedData.sub_division || "",
        post_office: savedData.post_office || autoFillData.address?.post_office || "",
        district: savedData.district || "",
        state: savedData.state || "",
        place: savedData.place || "",

        nominees:
          savedData.nominees?.length > 0
            ? savedData.nominees
            : (savedData.nominee_name ? [{ // Fallback for legacy single fields
                name: savedData.nominee_name,
                address: savedData.nominee_address, 
                relationship: savedData.nominee_relationship,
                age: savedData.nominee_age,
                share: savedData.nominee_share
            }] : [{ name: "", address: "", relationship: "", age: "", share: "" }]),
            
        witnesses: savedData.witnesses?.length > 0 
            ? savedData.witnesses 
            : [ {name: "", address: ""}, {name: "", address: ""} ], // Default 2 empty
        
        witnesses_place: wPlace,
        witnesses_date: formatDateForAPI(wDate),

        signature: undefined,
        isDraft: false,
      });

      const sigPath = savedData.signature_path || savedData.signature;
      if (sigPath) {
        // If it's a full URL (rare), use it, otherwise assume filename
        const url = sigPath.startsWith('http') ? sigPath : `http://localhost:3001/uploads/signatures/${sigPath}`;
        setSignaturePreview(url);
      }
    }
  }, [autoFillData, reset]);

  const onFormSubmit = async (values) => {
    
    if (values.isDraft) {
      try {
        const formData = new FormData();
        const formattedWitnessDate = formatDateForAPI(values.witnesses_date);

        Object.keys(values).forEach((key) => {
          if (key === "witnesses") {
            // Inject place and date into each witness object
            const enhancedWitnesses = (values.witnesses || []).map(w => ({
                 ...w,
                 place: values.witnesses_place || "",
                 date: formattedWitnessDate || ""
            }));
            formData.append(key, JSON.stringify(enhancedWitnesses));
          } else if (key === "nominees") {
            formData.append(key, JSON.stringify(values[key]));
          } else if (key === "signature") {
             if (values.signature instanceof File) {
               formData.append("signature", values.signature);
             }
          } else if (key === "date_of_appointment" || key === "witnesses_date") {
             const dateVal = formatDateForAPI(values[key]);
             formData.append(key, dateVal || "");
          } else {
            formData.append(key, values[key] || "");
          }
        });

        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:3001/api/forms/gratuity",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );

        if (response.ok) {
          await showAlert("Draft Saved!", { type: 'success' });
        } else {
          await showAlert("Failed to save draft.", { type: 'error' });
        }
      } catch (error) {
        console.error(error);
        await showAlert("Submission failed.", { type: 'error' });
      }
    } else {
      const savedData = autoFillData?.gratuityData || {};
      navigate("/forms/gratuity-form/preview", {
        state: {
          formData: {
            ...values,
            signature_path: savedData.signature_path || autoFillData?.signature
          },
          signaturePreview: signaturePreview,
          employeeId: autoFillData?.id || employeeId,
          isHR: false // Assuming default flow is employee side
        },
      });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <FormLayout
        title="FORM 'F'"
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
        {/* Header Info */}
        <div className="text-center mb-8 font-serif">
          <p className="font-semibold italic">See sub-rule (1) of Rule 6</p>
          <h2 className="text-xl font-bold uppercase mt-2">Nomination</h2>
        </div>


            {/* To Address */}
            <div>
              <span className="font-bold">To,</span>
              <div className="ml-4 mt-2 p-3 bg-gray-50 border rounded text-gray-700">
                <p className="font-bold">Vakrangee Limited</p>
                <p>Plot No. 93, Road No-16, M.I.D.C., Marol,</p>
                <p>Andheri (East), Mumbai - 400093, Maharashtra.</p>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-4">
                (Give here name or description of the establishment with full
                address)
              </p>
            </div>

            {/* Declaration */}
            <div className="text-justify m-5">
              <div className="mb-4">
                I, Shri/Shrimati/Kumari{" "}
                <span className="border-b border-black px-2 font-bold uppercase inline-block min-w-[16rem] ">
                  {[watch("firstname"), watch("middlename"), watch("lastname")]
                    .filter(Boolean)
                    .join(" ")}
                </span>

                <span className="text-xs text-gray-500 block mt-1 text-center">
                  (Name in full here)
                </span>
              </div>
              <p>
                whose particulars are given in the statement below, hereby
                nominate the person(s) mentioned below to receive the gratuity
                payable after my death as also the gratuity standing to my
                credit in the event of my death before that amount has become
                payable, or having become payable has not been paid and direct
                that the said amount of gratuity shall be paid in proportion
                indicated against the name(s) of the nominee(s).
              </p>
            </div>

            {/* Certified Clauses */}
            <div className="space-y-2 text-justify">
              <div className="flex gap-2">
                <span>2.</span>
                <p>
                  I hereby certify that the person(s) mentioned is/are a
                  member(s) of my family within the meaning of clause (h) of
                  Section 2 of the Payment of Gratuity Act, 1972.
                </p>
              </div>
              <div className="flex gap-2">
                <span>3.</span>
                <p>
                  I hereby declare that I have no family within the meaning of
                  clause (h) of Section 2 of the said Act.
                </p>
              </div>
              <div className="flex gap-2">
                <span>4.</span>
                <div className="space-y-1">
                  <p>
                    (a) My father/mother/parents is/are not dependent on me.
                  </p>
                  <p>
                    (b) My husband's father/mother/parents is/are not dependent
                    on my husband.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <span>5.</span>
                <p>
                  I have excluded my husband from my family by a notice dated
                  the <input className="border-b border-black w-32 cursor-not-allowed" disabled type="date" />{" "}
                  to the controlling authority in terms of the proviso to clause
                  (h) of Section 2 of the said Act.
                </p>
              </div>
              <div className="flex gap-2">
                <span>6.</span>
                <p>
                  Nomination made herein invalidates my previous nomination.
                </p>
              </div>
            </div>

            {/* Nominee Table with DynamicTable */}
            <div className="mt-8">
              <h3 className="font-bold text-center uppercase mb-4 text-lg">
                Nominee(s)
              </h3>
              
              <DynamicTable
                headers={[
                    "Name in full with full address of nominee(s)",
                    "Relationship with the employee",
                    "Age of nominee",
                    "Proportion by which the gratuity will be shared"
                ]}
                fields={nomineeFields}
                onRemove={removeNominee}
                renderRow={(item, index) => (
                    <>
                         <td className="border border-gray-300 p-1 align-top">
                           <TableInput
                                register={register(`nominees.${index}.name`)}
                                placeholder="Full Name"
                                error={errors.nominees?.[index]?.name}
                                required
                            />
                            <textarea
                                {...register(`nominees.${index}.address`)}
                                placeholder="Full Address"
                                className={`w-full border border-gray-200 outline-none p-1 text-xs h-16 resize-none mt-1 ${errors.nominees?.[index]?.address ? 'bg-red-50' : ''}`}
                            />
                            {errors.nominees?.[index]?.address && <span className="text-red-500 text-xs block px-1">{errors.nominees[index].address.message}</span>}
                         </td>
                         <TableInput
                            register={register(`nominees.${index}.relationship`)}
                            placeholder="e.g. Spouse"
                            error={errors.nominees?.[index]?.relationship}
                            required
                        />
                        <TableInput
                            type="number"
                            register={register(`nominees.${index}.age`)}
                            placeholder="Age"
                            error={errors.nominees?.[index]?.age}
                            required
                        />
                         <td className="border border-gray-300 p-1 align-top">
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    {...register(`nominees.${index}.share`)}
                                    placeholder="%"
                                    className={`w-full outline-none p-1 bg-transparent ${errors.nominees?.[index]?.share ? 'bg-red-50' : ''}`}
                                />
                                <span>%</span>
                            </div>
                             {errors.nominees?.[index]?.share && <span className="text-red-500 text-xs block px-1">{errors.nominees[index].share.message}</span>}
                        </td>
                    </>
                )}
              />
              <AddButton
                onClick={() =>
                  appendNominee({
                    name: "",
                    address: "",
                    relationship: "",
                    age: "",
                    share: "",
                  })
                }
                label="Add Nominee"
              />
            </div>

            {/* Personal Details (Redesigned) */}
            <div className="border border-gray-300 p-6 rounded bg-gray-50 mt-8">
              <h3 className="font-bold text-center uppercase mb-6 text-lg border-b border-gray-300 pb-2">
                1. Statement of Employee
              </h3>
              
              {/* Name Block */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                 <FormInput label="First Name" register={register} name="firstname" error={errors.firstname} required disabled={!!autoFillData?.fullName} />
                 <FormInput label="Middle Name" register={register} name="middlename"/>
                 <FormInput label="Last Name" register={register} name="lastname" error={errors.lastname} required disabled={!!autoFillData?.fullName} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <FormSelect label="Gender (Sex)" register={register} name="gender" options={["Male", "Female", "Other"]} error={errors.gender} required disabled={!!autoFillData?.gender} />
                <FormInput label="Religion" register={register} name="religion" error={errors.religion} required />
                <FormSelect label="Marital Status" register={register} name="marital_status" options={["Unmarried", "Married", "Widow", "Widower"]} error={errors.marital_status} required />
                
                {/* Work Details */}
                  <FormInput label="Department/Branch/Section" register={register} name="department" error={errors.department} required disabled={!!autoFillData?.department} />
                  <FormInput label="Ticket/Serial No. (Emp Code)" register={register} name="ticket_no" error={errors.ticket_no}/>
                  <FormInput label="Date of Appointment" type="date" register={register} name="date_of_appointment" error={errors.date_of_appointment} />
              </div>
              
              {/* Detailed Address */}
              <div className="mt-6 border-t border-gray-300 pt-4">
                  <h4 className="font-bold text-gray-600 mb-3">Permanent Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      
                      <FormInput label="Village/City" register={register} name="city" error={errors.city} required />
                      <FormInput label="Thana" register={register} name="thana" error={errors.thana} required />
                      <FormInput label="Sub-Division" register={register} name="sub_division" />
                      <FormInput label="Post Office" register={register} name="post_office" error={errors.post_office} required />
                      <FormInput label="District" register={register} name="district" error={errors.district} required />
                      <FormInput label="State" register={register} name="state" error={errors.state} required />
                  </div>
              </div>


              <div className="mt-8 flex justify-between gap-8">
                <div className="flex flex-col gap-5">
                  <div className="flex-1">
                    <label className="font-bold mr-2">Place (City):</label>
                    <input
                      {...register("place")}
                      className="border-b border-black outline-none px-2"
                      placeholder="e.g. Mumbai"
                    />
                    {errors.place && (
                      <span className="text-red-500 text-xs block">
                        Required
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="font-bold mr-2">Date:</label>
                    <span>{new Date().toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
                <div>
                  {signaturePreview ? (
                    <div className="mb-2 flex items-center justify-center">
                      <img
                        src={signaturePreview}
                        alt="Signature"
                        className="h-10 w-auto object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-16 mb-2 bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                      Signature Pending
                    </div>
                  )}
                  <p className="border-t border-gray-400 w-48 pt-2 font-semibold text-gray-700">
                    Employee Signature
                  </p>
                </div>
              </div>
            </div>

            {/* Declaration by Witnesses (Redesigned) */}
            <div>
              <h3 className="font-bold text-center uppercase mb-6 text-lg border-b border-gray-300 pb-2">
                Declaration by Witnesses
              </h3>
              <p className="mb-4 font-medium">
                Nomination signed/thumb-impressed before me.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {witnessFields.map((field, index) => (
                    <div key={field.id} className="space-y-3 p-4 border border-gray-200 rounded">
                      <h4 className="font-bold underline">Witness {index + 1}</h4>
                      <div>
                        <input
                          {...register(`witnesses.${index}.name`)}
                          placeholder="Name in full"
                          className="w-full border-b border-gray-300 py-1 outline-none"
                        />
                         {errors.witnesses?.[index]?.name && <span className="text-red-500 text-xs">Required</span>}
                      </div>
                      <div>
                        <textarea
                          {...register(`witnesses.${index}.address`)}
                          placeholder="Full Address"
                          className="w-full border border-gray-300 p-2 text-xs resize-none h-20 outline-none"
                        />
                         {errors.witnesses?.[index]?.address && <span className="text-red-500 text-xs">Required</span>}
                      </div>
                      <div className="flex justify-between items-end mt-2">
                         <div className="h-8 border-b border-dotted border-gray-400 text-gray-400 text-xs flex items-end w-32">
                            Signature
                         </div>
                      </div>
                    </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <label className="font-bold mr-2">Place:</label>
                  <input
                      {...register("witnesses_place")}
                      className="border-b border-black outline-none px-2 bg-transparent"
                      placeholder="Place"
                  />
                   {errors.witnesses_place && <span className="text-red-500 text-xs">Required</span>}
                </div>
                <div className="flex-1">
                  <label className="font-bold mr-2">Date:</label>
                  <input type="date" {...register("witnesses_date")} className="border-b border-black outline-none px-2 bg-transparent"/>
                  {errors.witnesses_date && <span className="text-red-500 text-xs">Required</span>}
                </div>
              </div>
            </div>

        {/* Certificate by Employer */}
        
        <div className="mt-10 pt-6 border-t-2 border-dashed border-gray-400 page-break-inside-avoid">
          <h4 className="font-bold uppercase text-center mb-6">
            Certificate by the Employer
          </h4>
          <p>
            Certified that the particulars of the above nomination have been
            verified and recorded in this establishment.
          </p>
          <div className="flex text-sm gap-10 justify-around mt-10">
          <div className="flex flex-col items-start gap-8 w-[45%]">
            <div>
              <p>Employer's Reference No., if any ______________</p>
            </div>
            <div>
              <p>Date: _____________</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-8 w-[35%]">
            <div className="text-left">
              <p className="border-t border-black pt-1">
                Signature of the employer/Officer authorised
              </p>
              <p>Designation</p>
            </div>
            <div className="text-left">
              <p className="border-t border-black pt-1">
                Name and address of the establishment or rubber stamp thereof.
              </p>
            </div>
          </div>
          </div>
        </div>
         {/* Acknowledgement */}
         <div className="mt-12 mb-5 pt-6 border-t-4 border-black page-break-inside-avoid">
                 <h4 className="font-bold text-lg text-center mb-6">Acknowledgement by the Employee</h4>
                 <p>Received the duplicate copy of nomination in Form 'F' filed by me and duly certified by the employer.</p>
                 <div className="flex justify-between items-end mt-12">
                     <div>
                        <p>Date:{new Date().toLocaleDateString('en-GB')}</p>
                     </div>
                   
                 </div>
             </div>
             <p>
             <span className="font-bold"> Note.</span> — Strike out the words/paragraphs not applicable.
             </p>
      </FormLayout>
    </>
  );
};

export default FormGratuity;
