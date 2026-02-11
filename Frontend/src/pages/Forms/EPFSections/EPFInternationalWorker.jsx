import React from "react";
import FormInput from "../../../Components/Forms/FormInput";
import FormSection from "../../../Components/Forms/FormSection";

const EPFInternationalWorker = ({ register, errors, internationalWorker }) => {
  return (
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
  );
};

export default EPFInternationalWorker;
