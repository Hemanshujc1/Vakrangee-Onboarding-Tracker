import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import FormLayout from "../../Components/Forms/FormLayout";
import FormInput from "../../Components/Forms/FormInput";
import FormSelect from "../../Components/Forms/FormSelect";
import FormSection from "../../Components/Forms/FormSection";
import { Loader2 } from "lucide-react";
import useAutoFill from "../../hooks/useAutoFill";
import { useAlert } from "../../context/AlertContext";
import {
  commonSchemas,
  createSignatureSchema,
} from "../../utils/validationSchemas";
import { onValidationFail, formatDateForAPI } from "../../utils/formUtils";
const FormEPF = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert } = useAlert();
  const {
    isEdit,
    isResubmitting,
    formData: stateData,
    rejectionReason: stateRejectionReason,
  } = location.state || {};
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [isEmployee, setIsEmployee] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Determine Target Employee ID
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const targetId =
    employeeId ||
    user.employeeId ||
    (user.role === "EMPLOYEE" ? user.id : null);

  const { data: autoFillData, loading: autoFillLoading } =
    useAutoFill(targetId);

  const isLocked = ["SUBMITTED", "VERIFIED"].includes(autoFillData?.epfStatus);

  const hasSavedSignature = !!(
    autoFillData?.epfData?.signature_path || autoFillData?.signature
  );

  // Validation Schema
  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        isDraft: Yup.boolean(),
        member_name_aadhar: commonSchemas.nameString,
        dob: commonSchemas.datePast,
        gender: Yup.string().required("Required"),
        marital_status: Yup.string().required("Required"),
        relationship_type: Yup.string().required("Required"),

        father_name: Yup.string().when("relationship_type", {
          is: "Father",
          then: (schema) => commonSchemas.nameStringOptional.required("Father's Name Required"),
        }),
        spouse_name: Yup.string().when("relationship_type", {
          is: "Spouse",
          then: (schema) => commonSchemas.nameStringOptional.required("Spouse's Name Required"),
        }),
        email: commonSchemas.email,
        mobile: commonSchemas.mobile,

        uan_number: Yup.string().when(["prev_epf_member", "prev_eps_member"], {
          is: (epf, eps) => epf === "Yes" || eps === "Yes",
          then: (schema) => commonSchemas.uan.required("UAN Required"),
          otherwise: (schema) => schema.notRequired().nullable(),
        }),
        prev_pf_number: Yup.string().nullable().optional(),
        date_of_exit_prev: commonSchemas.datePastOptional
          .nullable()
          .transform((v, o) => (o === "" ? null : v)),
        scheme_cert_no: Yup.string().nullable().optional(),
        ppo_no: Yup.string().nullable().optional(),
        
        // International Worker
        international_worker: Yup.string().required("Required"),
        country_of_origin: Yup.string().when("international_worker", {
          is: "Yes",
          then: (schema) => commonSchemas.stringRequired.label("Country").required("Country Required"),
        }),
        passport_no: Yup.string().when("international_worker", {
          is: "Yes",
          then: (schema) =>
            commonSchemas.passport.required("Passport Required"),
        }),
        passport_valid_from: Yup.date()
          .nullable()
          .when("international_worker", {
              is: "Yes",
              then: (schema) => commonSchemas.datePast.required("Required"),
          })
          .transform((v, o) => (o === "" ? null : v)),
        passport_valid_to: Yup.date()
          .nullable()
          .when("international_worker", {
              is: "Yes",
              then: (schema) => commonSchemas.dateFuture.required("Required"),
          })
          .transform((v, o) => (o === "" ? null : v)),

        // KYC
        bank_account_no: commonSchemas.bankAccount,
        ifsc_code: commonSchemas.ifsc,
        aadhaar_no: commonSchemas.aadhaar,
        pan_no: commonSchemas.pan,
        
        // PF History
        first_epf_enrolled_date: commonSchemas.datePast.nullable().transform((v, o) => (o === "" ? null : v)),
        first_epf_wages: commonSchemas.currency,
        pre_2014_member: Yup.string().nullable().optional(),
        withdrawn_epf: Yup.string().nullable().optional(),
        withdrawn_eps: Yup.string().nullable().optional(),
        post_2014_eps_withdrawn: Yup.string().nullable().optional(),

        // Previous Employment
        prev_epf_member: Yup.string().optional(),
        prev_eps_member: Yup.string().optional(),

        place: Yup.string().required("Required"),
        present_joining_date: commonSchemas.datePastOptional
          .nullable()
          .transform((v, o) => (o === "" ? null : v)),
        present_pf_number: Yup.string().nullable().optional(),
        present_kyc_status: Yup.string().nullable().optional(),
        present_transfer_status: Yup.string().nullable().optional(),

        // Signature
        signature: Yup.mixed().when("isDraft", {
          is: true,
          then: (schema) => Yup.mixed().nullable().optional(),
          otherwise: (schema) => createSignatureSchema(hasSavedSignature),
        }),
      }),
    [hasSavedSignature]
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      relationship_type: "Father",
      prev_epf_member: "No",
      prev_eps_member: "No",
      international_worker: "No",
      isDraft: false,
    },
  });

  // Watch fields for conditional rendering
  const prevEpfMember = watch("prev_epf_member");
  const prevEpsMember = watch("prev_eps_member");
  const internationalWorker = watch("international_worker");
  const relationshipType = watch("relationship_type");

  useEffect(() => {
    if (user.role === "EMPLOYEE") {
      setIsEmployee(true);
    }
  }, []);

  useEffect(() => {
    if (stateData) {
      // Prioritize stateData (from preview 'Back' or 'Edit')
      reset(stateData);
      if (stateData.signature_path) {
        setSignaturePreview(
          `/uploads/signatures/${stateData.signature_path}`
        );
      }
    } else if (autoFillData) {
      const savedData = autoFillData.epfData || {};
      const appData = autoFillData.applicationData || {};

      const formValues = {
        ...savedData,
        member_name_aadhar:
          savedData.member_name_aadhar || autoFillData.fullName || "",
        dob: formatDateForAPI(savedData.dob || autoFillData.dateOfBirth || ""),
        gender: savedData.gender || autoFillData.gender || "",
        email: savedData.email || autoFillData.email || "",
        mobile: savedData.mobile || autoFillData.mobileNo || "",

        bank_account_no:
          savedData.bank_account_no || autoFillData.bankAccountNo || "",
        ifsc_code: savedData.ifsc_code || autoFillData.ifscCode || "",
        aadhaar_no: savedData.aadhaar_no || autoFillData.aadhaar || "",
        pan_no: savedData.pan_no || autoFillData.panNo || "",

        passport_no: savedData.passport_no || appData.passportNo || "",
        passport_valid_from: formatDateForAPI(
          savedData.passport_valid_from || appData.passportIssueDate || ""
        ),
        passport_valid_to: formatDateForAPI(
          savedData.passport_valid_to || appData.passportExpiryDate || ""
        ),

        present_joining_date: formatDateForAPI(
          savedData.present_joining_date || autoFillData.joiningDate || ""
        ),
        date_of_exit_prev: formatDateForAPI(savedData.date_of_exit_prev || ""),
        first_epf_enrolled_date: formatDateForAPI(
          savedData.first_epf_enrolled_date || ""
        ),
        signature_path:
          savedData.signature_path || autoFillData.signature || "",
      };

      reset(formValues);

      // Handle Signature Preview
      const sigPath = savedData.signature_path || autoFillData.signature;
      if (sigPath) {
        setSignaturePreview(
          `/uploads/signatures/${sigPath}`
        );
      }
    }
  }, [autoFillData, reset, stateData]);

  const onFormSubmit = async (values) => {
    const allValues = {
      ...values,
      member_name_aadhar: getValues("member_name_aadhar"),
      dob: getValues("dob"),
      present_joining_date: getValues("present_joining_date"),
      date_of_exit_prev: getValues("date_of_exit_prev"),
      passport_valid_from: getValues("passport_valid_from"),
      passport_valid_to: getValues("passport_valid_to"),
      first_epf_enrolled_date: getValues("first_epf_enrolled_date"),
    };

    if (allValues.isDraft) {
      try {
        const formData = new FormData();
        Object.keys(allValues).forEach((key) => {
          if (key === "signature") {
            if (allValues.signature instanceof File) {
              formData.append("signature", allValues.signature);
            }
          } else if (
            key !== "signature_path" &&
            key !== "sinature_of_employer_path"
          ) {
            let value = allValues[key];

            // Format dates
            if (
              [
                "dob",
                "present_joining_date",
                "date_of_exit_prev",
                "passport_valid_from",
                "passport_valid_to",
                "first_epf_enrolled_date",
              ].includes(key)
            ) {
              value = formatDateForAPI(value);
            }

            formData.append(key, value == null ? "" : value);
          }
        });

        const token = localStorage.getItem("token");
        await axios.post("/api/forms/epf", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (isPreviewMode) {
            const savedData = autoFillData?.epfData || {};
            navigate(`/forms/employees-provident-fund/preview/${targetId}`, {
              state: {
                formData: {
                  ...allValues,
                  signature_path: savedData.signature_path || autoFillData?.signature,
                },
                signaturePreview: signaturePreview,
                employeeId: targetId,
                isHR: false,
                status: "DRAFT",
                fromPreviewSubmit: true,
              },
            });
        } else {
            await showAlert("Draft Saved!", { type: 'success' });
        }
      } catch (error) {
        console.error("Draft Save Error", error);
        await showAlert(
          `Failed to save draft: ${error.response?.data?.message || error.message}`,
          { type: 'error' }
        );
      } finally {
          setIsPreviewMode(false);
      }
    } else {
      // PREVIEW FLOW
      const savedData = autoFillData?.epfData || {};
      navigate(`/forms/employees-provident-fund/preview/${targetId}`, {
        state: {
          formData: {
            ...allValues,
            signature_path: savedData.signature_path || autoFillData?.signature,
          },
          signaturePreview: signaturePreview,
          employeeId: targetId,
          isHR: false,
          status: "DRAFT",
        },
      });
    }
  };

  if (autoFillLoading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
      </div>
    );

  return (
    <FormLayout
      title="EPF REGISTRATION FORM"
      employeeData={targetId}
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
        onSubmit: () => {
          setIsPreviewMode(true);
          setValue("isDraft", true);
        },
      }}
      signature={{
        setValue,
        error: errors.signature,
        preview: signaturePreview,
        setPreview: setSignaturePreview,
        isSaved: hasSavedSignature,
        fieldName: "signature",
    }}
    >
      {/* Rejection Alert */}
      {(isResubmitting || autoFillData?.epfStatus === "REJECTED") && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <div className="font-bold flex items-center gap-2 mb-1 text-sm">
            <Loader2 className="h-4 w-4" /> This form was rejected and needs corrections
          </div>
          <p className="text-sm px-1">
            <span className="font-semibold">Reason:</span>{" "}
            {stateRejectionReason || autoFillData?.epfRejectionReason}
          </p>
        </div>
      )}

      <div className="relative mb-6">
        <div className="flex justify-between items-start">
          <img
            src={`${import.meta.env.BASE_URL}epf form logo.webp`}
            alt="EPF Logo"
            className="w-20"
            onError={(e) => (e.target.style.display = "none")} // Fallback
          />
          <div className="text-right text-xs">
            <p className="font-bold">New Form : 11 - Declaration Form</p>
            <p>(To be retained by the employer for future reference)</p>
          </div>
        </div>
      </div>

      <div className="text-center text-sm mb-6">
        <p>Employees' Provident Fund Scheme, 1952 (Paragraph 34 & 57) and</p>
        <p>Employees' Pension Scheme, 1995 (Paragraph 24)</p>
        <p className="text-xs italic mt-1">
          (Declaration by a person taking up Employment in any Establishment on
          which EPF Scheme, 1952 and for EPS, 1995 is applicable)
        </p>
      </div>

      <FormSection title="1. Member Details">
        <FormInput
          label="Name of Member (Aadhar Name)"
          register={register}
          name="member_name_aadhar"
          className="uppercase"
          error={errors.member_name_aadhar}
          disabled
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Date of Birth"
            type="date"
            register={register}
            name="dob"
            error={errors.dob}
            disabled
          />
          <FormSelect
            label="Gender"
            register={register}
            name="gender"
            options={["Male", "Female", "Transgender"]}
            error={errors.gender}
          />
          <FormSelect
            label="Marital Status"
            register={register}
            name="marital_status"
            options={["Single", "Married", "Widow", "Widower", "Divorcee"]}
            error={errors.marital_status}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase text-gray-600 mb-2">
              Relationship
            </label>
            <div className="flex gap-4 mb-2">
              <label
                className={`flex items-center gap-2 cursor-pointer text-sm ${
                  errors.relationship_type ? "text-red-600" : ""
                }`}
              >
                <input
                  type="radio"
                  value="Father"
                  {...register("relationship_type")}
                />{" "}
                Father
              </label>
              <label
                className={`flex items-center gap-2 cursor-pointer text-sm ${
                  errors.relationship_type ? "text-red-600" : ""
                }`}
              >
                <input
                  type="radio"
                  value="Spouse"
                  {...register("relationship_type")}
                />{" "}
                Spouse
              </label>
            </div>
            {errors.relationship_type && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.relationship_type.message}
              </p>
            )}
            <FormInput
              label={
                relationshipType === "Father"
                  ? "Father's Name"
                  : "Spouse's Name"
              }
              register={register}
              name={
                relationshipType === "Father" ? "father_name" : "spouse_name"
              }
              className="uppercase"
              error={
                relationshipType === "Father"
                  ? errors.father_name
                  : errors.spouse_name
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormInput
            label="Email ID"
            type="email"
            register={register}
            name="email"
            error={errors.email}
          />
          <FormInput
            label="Mobile No (Aadhar Registered)"
            type="tel"
            register={register}
            name="mobile"
            error={errors.mobile}
          />
        </div>
      </FormSection>

      <FormSection title="2. Previous Employment Details">
        <div
          className={`mb-4 space-y-2 p-3 rounded-md transition-colors ${
            errors.prev_epf_member || errors.prev_eps_member
              ? "bg-red-50 border border-red-200"
              : ""
          }`}
        >
          <p
            className={`text-sm font-semibold ${
              errors.prev_epf_member ? "text-red-600" : ""
            }`}
          >
            Previous Member of EPF Scheme, 1952?
          </p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                value="Yes"
                {...register("prev_epf_member")}
              />{" "}
              Yes
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" value="No" {...register("prev_epf_member")} />{" "}
              No
            </label>
          </div>
          {errors.prev_epf_member && (
            <p className="text-red-500 text-[10px]">
              {errors.prev_epf_member.message}
            </p>
          )}

          <p
            className={`text-sm font-semibold mt-4 ${
              errors.prev_eps_member ? "text-red-600" : ""
            }`}
          >
            Previous Member of EPS Scheme, 1995?
          </p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                value="Yes"
                {...register("prev_eps_member")}
              />{" "}
              Yes
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" value="No" {...register("prev_eps_member")} />{" "}
              No
            </label>
          </div>
          {errors.prev_eps_member && (
            <p className="text-red-500 text-[10px]">
              {errors.prev_eps_member.message}
            </p>
          )}
        </div>

        {(prevEpfMember === "Yes" || prevEpsMember === "Yes") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <FormInput
              label="Universal Account Number (UAN)"
              register={register}
              name="uan_number"
              error={errors.uan_number}
            />
            <FormInput
              label="Previous PF Account Number"
              register={register}
              name="prev_pf_number"
              error={errors.prev_pf_number}
            />
            <FormInput
              label="Date of Exit from Previous Employment"
              type="date"
              register={register}
              name="date_of_exit_prev"
              error={errors.date_of_exit_prev}
            />
            <FormInput
              label="Scheme Certificate No (If issued)"
              register={register}
              name="scheme_cert_no"
              error={errors.scheme_cert_no}
            />
            <FormInput
              label="Pension Payment Order (PPO) (If issued)"
              register={register}
              name="ppo_no"
              error={errors.ppo_no}
            />
          </div>
        )}
      </FormSection>

      <FormSection title="3. International Worker">
        <div
          className={`mb-4 p-3 rounded-md transition-colors ${
            errors.international_worker ? "bg-red-50 border border-red-200" : ""
          }`}
        >
          <p
            className={`text-sm font-semibold mb-2 ${
              errors.international_worker ? "text-red-600" : ""
            }`}
          >
            Are you an International Worker?
          </p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                value="Yes"
                {...register("international_worker")}
              />{" "}
              Yes
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                value="No"
                {...register("international_worker")}
              />{" "}
              No
            </label>
          </div>
          {errors.international_worker && (
            <p className="text-red-500 text-[10px] mt-1">
              {errors.international_worker.message}
            </p>
          )}
        </div>

        {internationalWorker === "Yes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <FormInput
              label="Country of Origin"
              register={register}
              name="country_of_origin"
              error={errors.country_of_origin}
            />
            <FormInput
              label="Passport No."
              register={register}
              name="passport_no"
              error={errors.passport_no}
            />
            <FormInput
              label="Passport Valid From"
              type="date"
              register={register}
              name="passport_valid_from"
              error={errors.passport_valid_from}
            />
            <FormInput
              label="Passport Valid To"
              type="date"
              register={register}
              name="passport_valid_to"
              error={errors.passport_valid_to}
            />
          </div>
        )}
      </FormSection>

      <FormSection title="4. KYC Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Bank Account No."
            register={register}
            name="bank_account_no"
            error={errors.bank_account_no}
          />
          <FormInput
            label="IFSC Code"
            register={register}
            name="ifsc_code"
            className="uppercase"
            error={errors.ifsc_code}
          />
          <FormInput
            label="AADHAR Number"
            register={register}
            name="aadhaar_no"
            error={errors.aadhaar_no}
          />
          <FormInput
            label="PAN Number"
            register={register}
            name="pan_no"
            className="uppercase"
            error={errors.pan_no}
          />
        </div>
      </FormSection>

      {/* 12. History Table */}
      <FormSection title="5. PF History (If applicable)">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormInput
            label="First EPF Member Enrolled Date"
            type="date"
            register={register}
            name="first_epf_enrolled_date"
            error={errors.first_epf_enrolled_date}
          />
          <FormInput
            label="First Employment EPF Wages"
            type="number"
            register={register}
            name="first_epf_wages"
            error={errors.first_epf_wages}
          />
          <FormSelect
            label="Member before Sep 2014?"
            register={register}
            name="pre_2014_member"
            options={["Yes", "No"]}
            error={errors.pre_2014_member}
          />
          <FormSelect
            label="EPF Withdrawn?"
            register={register}
            name="withdrawn_epf"
            options={["Yes", "No"]}
            error={errors.withdrawn_epf}
          />
          <FormSelect
            label="EPS Withdrawn?"
            register={register}
            name="withdrawn_eps"
            options={["Yes", "No"]}
            error={errors.withdrawn_eps}
          />
          <FormSelect
            label="Post 2014 EPS Withdrawn?"
            register={register}
            name="post_2014_eps_withdrawn"
            options={["Yes", "No"]}
            error={errors.post_2014_eps_withdrawn}
          />
        </div>
      </FormSection>

      {/* Undertaking & Signature */}
      <div className="mt-8 pt-4">
        <h1 className="font-bold underline underline-offset-4 text-center mb-4">
          Undertaking
        </h1>
        <ul className="list-decimal list-inside text-sm space-y-1 mb-6">
          <li>
            Certified that the particulars are true to the best of my knowledge
          </li>
          <li>
            I authorise EPFO to use my Aadhar for verification / authentication
            / eKYC purpose for service delivery
          </li>
          <li>
            Kindly transfer the fund and service details, if applicable, from
            the previous PF account as declared above to the present PF account.
          </li>
          <li>
            In case of changes in above details, the same will be intimated to
            employer at the earliest.
          </li>
        </ul>

        <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
          <div className="text-sm flex flex-col gap-3">
            <p>Date: {new Date().toLocaleDateString("en-GB")}</p>
            <p>
              Place:{" "}
              <input
                type="text"
                placeholder="Enter Place"
                {...register("place")}
                className={`border-b outline-none px-1 ${
                  errors.place ? "border-red-500" : "border-gray-400"
                }`}
              />
            </p>
            {errors.place && (
              <p className="text-red-500 text-[10px]">{errors.place.message}</p>
            )}
          </div>

          <div>
            {/* Signature is now in FormLayout */}
            <p className="text-center text-xs mt-1 text-gray-500 italic">
              Signature of the Employee
            </p>
          </div>
        </div>
      </div>

      {/* Declaration by Employer */}
      <div className="flex flex-col mb-4 pt-4">
        <h1 className="text-center underline-offset-4 underline font-bold">
          DECLARATION BY PRESENT EMPLOYER
        </h1>
        <ul className="list-[upper-alpha] list-inside text-sm mt-5 flex flex-col gap-2">
          <li>
            The member{" "}
            <span className="underline font-bold mr-2 uppercase">
              {watch("member_name_aadhar") || "____________________"}
            </span>
            has joined on{" "}
            <span className="inline-block relative">
              <input
                disabled={isEmployee}
                type="date"
                {...register("present_joining_date")}
                className={`border-b outline-none px-1 ${
                  errors.present_joining_date
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
              />
              {errors.present_joining_date && (
                <span className="absolute -bottom-4 left-0 text-red-500 text-[10px] whitespace-nowrap">
                  {errors.present_joining_date.message}
                </span>
              )}
            </span>{" "}
            and has been alloted PF Number
            <span className="inline-block relative">
              <input
                disabled={isEmployee}
                type="text"
                {...register("present_pf_number")}
                className={`border-b outline-none px-1 ml-1 w-32 ${
                  errors.present_pf_number
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
              />
              {errors.present_pf_number && (
                <span className="absolute -bottom-4 left-1 text-red-500 text-[10px] whitespace-nowrap">
                  {errors.present_pf_number.message}
                </span>
              )}
            </span>
            .
          </li>

          <li>
            In case the person was earlier not a member of EPF Scheme, 1952 and
            EPS, 1995:
            <span className="italic block text-xs mb-1">
              ((Post allotment of UAN) The UAN alloted or the member is) Please
              Tick the Appropriate Option:
            </span>
            <span className="font-semibold block mb-2">
              The KYC details of the above member in the UAN database
            </span>
            <div
              className={`flex flex-col md:flex-row gap-4 mt-2 p-2 rounded ${
                errors.present_kyc_status
                  ? "bg-red-50 border border-red-200"
                  : ""
              }`}
            >
              <label className="flex items-center gap-1">
                <input
                  disabled={isEmployee}
                  type="radio"
                  value="Not Uploaded"
                  {...register("present_kyc_status")}
                />{" "}
                Have not been Uploaded
              </label>
              <label className="flex items-center gap-1">
                <input
                  disabled={isEmployee}
                  type="radio"
                  value="Uploaded Not Approved"
                  {...register("present_kyc_status")}
                />{" "}
                Have been Uploaded but not approved
              </label>
              <label className="flex items-center gap-1">
                <input
                  disabled={isEmployee}
                  type="radio"
                  value="Approved DSC"
                  {...register("present_kyc_status")}
                />{" "}
                Have been Uploaded and approved with DSC
              </label>
            </div>
            {errors.present_kyc_status && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.present_kyc_status.message}
              </p>
            )}
          </li>

          <li>
            In case the person was earlier a member of EPF Scheme, 1952 and EPS
            1995;
            <div
              className={`flex flex-col gap-2 mt-2 p-2 rounded ${
                errors.present_transfer_status
                  ? "bg-red-50 border border-red-200"
                  : ""
              }`}
            >
              <label className="flex items-start gap-2">
                <input
                  disabled={isEmployee}
                  type="radio"
                  value="Approved DSC Transfer"
                  {...register("present_transfer_status")}
                  className="mt-1"
                />
                <span>
                  The KYC details of the above member in the UAN database have
                  been approved with Digital Signature Certificate and transfer
                  request has been generated on portal
                </span>
              </label>
              <label className="flex items-start gap-2">
                <input
                  disabled={isEmployee}
                  type="radio"
                  value="Physical Claim"
                  {...register("present_transfer_status")}
                  className="mt-1"
                />
                <span>
                  As the DSC of establishment are not registered with EPFO, the
                  member has been informed to file physical claim (Form-13) for
                  transfer of funds from his previous establishment.
                </span>
              </label>
            </div>
            {errors.present_transfer_status && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.present_transfer_status.message}
              </p>
            )}
          </li>
        </ul>

        <div className="flex justify-between mt-12 items-end">
          <span>Date:</span>
          <div className="text-center">
            <div className="w-48 h-12 mb-1"></div>
            <span>Signature of Employer with Seal of Establishment</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
    </FormLayout>
  );
};

export default FormEPF;
