import React from "react";
import FormInput from "../../../Components/Forms/FormInput";
import FormSection from "../../../Components/Forms/FormSection";

const EPFPreviousEmployment = ({
  register,
  errors,
  prevEpfMember,
  prevEpsMember,
}) => {
  return (
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
            <input type="radio" value="Yes" {...register("prev_epf_member")} />{" "}
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
            <input type="radio" value="Yes" {...register("prev_eps_member")} />{" "}
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
  );
};

export default EPFPreviousEmployment;
