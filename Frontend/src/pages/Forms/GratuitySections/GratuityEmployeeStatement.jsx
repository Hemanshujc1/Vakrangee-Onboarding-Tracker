import { React, FormInput, FormSelect } from "../../../utils/formDependencies";

const GratuityEmployeeStatement = ({
  register,
  errors,
  autoFillData,
  signaturePreview,
}) => (
  <div className="border border-gray-300 p-6 rounded bg-gray-50 mt-8">
    <h3 className="font-bold text-center uppercase mb-6 text-lg border-b border-gray-300 pb-2">
      1. Statement of Employee
    </h3>

    {/* Name Block */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <FormInput
        label="First Name"
        register={register}
        name="firstname"
        error={errors.firstname}
        required
        disabled={!!autoFillData?.fullName}
      />
      <FormInput label="Middle Name" register={register} name="middlename" />
      <FormInput
        label="Last Name"
        register={register}
        name="lastname"
        error={errors.lastname}
        required
        disabled={!!autoFillData?.fullName}
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
      <FormSelect
        label="Gender (Sex)"
        register={register}
        name="gender"
        options={["Male", "Female", "Other"]}
        error={errors.gender}
        required
        disabled={!!autoFillData?.gender}
      />
      <FormInput
        label="Religion"
        register={register}
        name="religion"
        error={errors.religion}
        required
      />
      <FormSelect
        label="Marital Status"
        register={register}
        name="marital_status"
        options={["Unmarried", "Married", "Widow", "Widower"]}
        error={errors.marital_status}
        required
      />

      {/* Work Details */}
      <FormInput
        label="Department/Branch/Section"
        register={register}
        name="department"
        error={errors.department}
        required
        disabled={!!autoFillData?.department}
      />
      <FormInput
        label="Ticket/Serial No. (Emp Code)"
        register={register}
        name="ticket_no"
        error={errors.ticket_no}
      />
      <FormInput
        label="Date of Appointment"
        type="date"
        register={register}
        name="date_of_appointment"
        error={errors.date_of_appointment}
      />
    </div>

    {/* Detailed Address */}
    <div className="mt-6 border-t border-gray-300 pt-4">
      <h4 className="font-bold text-gray-600 mb-3">Permanent Address</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormInput
          label="Village/City"
          register={register}
          name="city"
          error={errors.city}
          required
        />
        <FormInput
          label="Thana"
          register={register}
          name="thana"
          error={errors.thana}
          required
        />
        <FormInput
          label="Sub-Division"
          register={register}
          name="sub_division"
        />
        <FormInput
          label="Post Office"
          register={register}
          name="post_office"
          error={errors.post_office}
          required
        />
        <FormInput
          label="District"
          register={register}
          name="district"
          error={errors.district}
          required
        />
        <FormInput
          label="State"
          register={register}
          name="state"
          error={errors.state}
          required
        />
      </div>
    </div>

    <div className="mt-8 flex justify-between gap-8">
      <div className="flex flex-col gap-5">
        <div className="flex-1">
          <label className="font-bold mr-2">Place (City):</label>
          <input
            {...register("place")}
            className="border-b border-black outline-none px-2 bg-transparent"
            placeholder="e.g. Mumbai"
          />
          {errors.place && (
            <span className="text-red-500 text-xs block">Required</span>
          )}
        </div>
        <div className="flex-1">
          <label className="font-bold mr-2">Date:</label>
          <span>{new Date().toLocaleDateString("en-GB")}</span>
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
);

export default GratuityEmployeeStatement;
