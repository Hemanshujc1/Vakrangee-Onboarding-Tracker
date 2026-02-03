import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";
import FormSelect from "../../../Components/Forms/FormSelect";
import FormTextArea from "../../../Components/Forms/FormTextArea";

const EmploymentDetails = ({ register, errors, empFields }) => {
  return (
    <FormSection title="Employment Details">
      {empFields.map((item, index) => (
        <div
          key={item.id}
          className="border border-gray-300 p-6 rounded-lg mb-6 shadow-sm bg-white relative"
        >
          <div className="flex flex-col gap-4">
            <FormInput
              label="Company Name"
              name={`employment_details.${index}.companyName`}
              register={register}
              error={errors.employment_details?.[index]?.companyName}
            />
            <FormInput
              label="Address"
              name={`employment_details.${index}.address`}
              register={register}
              error={errors.employment_details?.[index]?.address}
            />
            <FormSelect
              label="Employment Type"
              name={`employment_details.${index}.empType`}
              options={["Full Time", "Consultants", "Contractual", "Temporary"]}
              register={register}
              error={errors.employment_details?.[index]?.empType}
            />
            <FormInput
              label="Employment Code"
              name={`employment_details.${index}.empCode`}
              register={register}
              error={errors.employment_details?.[index]?.empCode}
            />

            <div className="mt-4 flex flex-col md:flex-row gap-4 p-3 bg-white rounded border border-gray-200 items-start md:items-center">
              <div className="flex items-center">
                <label className="font-bold text-gray-700 mr-2 whitespace-nowrap">
                  Tenure
                </label>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <FormInput
                  label="Start Date"
                  type="date"
                  name={`employment_details.${index}.startDate`}
                  register={register}
                  error={errors.employment_details?.[index]?.startDate}
                />
                <FormInput
                  label="End Date"
                  type="date"
                  name={`employment_details.${index}.endDate`}
                  register={register}
                  error={errors.employment_details?.[index]?.endDate}
                />
              </div>
            </div>

            <FormInput
              label="Position Held"
              name={`employment_details.${index}.position`}
              register={register}
              error={errors.employment_details?.[index]?.position}
            />
            <FormInput
              label="Compensation (Per Annum) (INR - Rupees)"
              name={`employment_details.${index}.compensation`}
              type="number"
              register={register}
              error={errors.employment_details?.[index]?.compensation}

            />
            <FormInput
              label="City Last Worked"
              name={`employment_details.${index}.city`}
              register={register}
              error={errors.employment_details?.[index]?.city}

            />

            {/* HR Rep */}
            <div className="col-span-1 md:col-span-2 font-bold text-gray-700 border-b pb-2 mt-4 bg-gray-100 p-2 rounded">
              HR Representative
            </div>
            <FormInput
              label="Name"
              name={`employment_details.${index}.hrRep`}
              register={register}
              error={errors.employment_details?.[index]?.hrRep}

            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Telephone"
                name={`employment_details.${index}.hrTel`}
                register={register}
                error={errors.employment_details?.[index]?.hrTel}
              />
              <FormInput
                label="Mobile"
                name={`employment_details.${index}.hrMob`}
                register={register}
                error={errors.employment_details?.[index]?.hrMob}

              />
            </div>
            <FormInput
              label="Email"
              name={`employment_details.${index}.hrEmail`}
              register={register}
              error={errors.employment_details?.[index]?.hrEmail}

            />

            {/* Supervisor */}
            <div className="col-span-1 md:col-span-2 font-bold text-gray-700 border-b pb-2 mt-4 bg-gray-100 p-2 rounded">
              Supervisor
            </div>
            <FormInput
              label="Name"
              name={`employment_details.${index}.supervisorName`}
              register={register}
              error={errors.employment_details?.[index]?.supervisorName}

            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Telephone"
                name={`employment_details.${index}.supTel`}
                register={register}
                error={errors.employment_details?.[index]?.supTel}
              />
              <FormInput
                label="Mobile"
                name={`employment_details.${index}.supMob`}
                register={register}
                error={errors.employment_details?.[index]?.supMob}

              />
            </div>
            <FormInput
              label="Email"
              name={`employment_details.${index}.supEmail`}
              register={register}
              error={errors.employment_details?.[index]?.supEmail}

            />

            <FormInput
              label="Designation"
              name={`employment_details.${index}.designation`}
              register={register}
              error={errors.employment_details?.[index]?.designation}

            />
            <div className="mt-4 flex flex-col md:flex-row gap-4 p-3 bg-white rounded border border-gray-200 items-start md:items-center">
              <div className="flex items-center">
                <label className="font-bold text-gray-700 mr-2 whitespace-nowrap">
                  Reporting Period
                </label>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <FormInput
                  label="Start Date"
                  type="date"
                  name={`employment_details.${index}.reportStartDate`}
                  register={register}
                  error={errors.employment_details?.[index]?.reportStartDate}

                />
                <FormInput
                  label="End Date"
                  type="date"
                  name={`employment_details.${index}.reportEndDate`}
                  register={register}
                  error={errors.employment_details?.[index]?.reportEndDate}
                />
              </div>
            </div>

            {/* 2nd Supervisor Details */}
            <div className="col-span-1 md:col-span-2 mt-6 p-4 border border-gray-200 rounded bg-gray-50">
              <p className="italic mb-4 text-sm text-gray-600">
                In case the reporting period to the above Referee is less than 9
                months or any other Supervisor in the above stated tenure,
                Kindly give details of the next reporting Supervisor.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Supervisor Name"
                  name={`employment_details.${index}.supervisorName2`}
                  register={register}
                  error={errors.employment_details?.[index]?.supervisorName2}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Telephone"
                    name={`employment_details.${index}.supTel2`}
                    register={register}
                    error={errors.employment_details?.[index]?.supTel2}
                  />
                  <FormInput
                    label="Mobile"
                    name={`employment_details.${index}.supMob2`}
                    register={register}
                    error={errors.employment_details?.[index]?.supMob2}
                  />
                </div>
                <FormInput
                  label="Email"
                  name={`employment_details.${index}.supEmail2`}
                  register={register}
                  error={errors.employment_details?.[index]?.supEmail2}
                />
                <FormInput
                  label="Designation"
                  name={`employment_details.${index}.designation2`}
                  register={register}
                  error={errors.employment_details?.[index]?.designation2}
                />
              </div>
              <div className="mt-4 flex flex-col md:flex-row gap-4 p-3 bg-white rounded border border-gray-200 items-start md:items-center">
                <div className="flex items-center">
                  <label className="font-bold text-gray-700 mr-2 whitespace-nowrap">
                    Reporting Period
                  </label>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <FormInput
                    label="Start Date"
                    type="date"
                    name={`employment_details.${index}.reportStartDate2`}
                    register={register}
                    error={errors.employment_details?.[index]?.reportStartDate2}
                  />
                  <FormInput
                    label="End Date"
                    type="date"
                    name={`employment_details.${index}.reportEndDate2`}
                    register={register}
                    error={errors.employment_details?.[index]?.reportEndDate2}
                    
                  />
                </div>
              </div>
            </div>

            <FormTextArea
              label="Nature of Duties"
              name={`employment_details.${index}.duties`}
              register={register}
              error={errors.employment_details?.[index]?.duties}

            />
            <FormTextArea
              label="Reason for Leaving"
              name={`employment_details.${index}.reasonLeaving`}
              register={register}
              error={errors.employment_details?.[index]?.reasonLeaving}

            />
          </div>
        </div>
      ))}
    </FormSection>
  );
};

export default EmploymentDetails;
