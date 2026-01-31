import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";
import FormSelect from "../../../Components/Forms/FormSelect";
import FormTextArea from "../../../Components/Forms/FormTextArea";

const EducationDetails = ({ register, errors, eduFields }) => {
  return (
    <FormSection title="Educational Details">
      {eduFields.map((item, index) => (
        <div
          key={item.id}
          className="border border-gray-300 p-6 rounded-lg mb-6 shadow-sm relative bg-white"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect
              label="Course"
              name={`educational_details.${index}.course`}
              options={[
                "10th",
                "12th",
                "Graduation",
                "Post Graduation",
                "Others",
              ]}
              register={register}
              error={errors.educational_details?.[index]?.course}
              required
            />
            <FormInput
              label="Degree/Specialization"
              name={`educational_details.${index}.degree`}
              register={register}
              error={errors.educational_details?.[index]?.degree}
              required
            />

            <FormInput
              label="Institute/College"
              name={`educational_details.${index}.institute`}
              register={register}
              error={errors.educational_details?.[index]?.institute}
              required
            />
            <FormInput
              label="Address"
              name={`educational_details.${index}.address`}
              register={register}
              error={errors.educational_details?.[index]?.address}
              required
            />
            <FormInput
              label="State"
              name={`educational_details.${index}.state`}
              register={register}
              error={errors.educational_details?.[index]?.state}
              required
            />
            <FormInput
              label="Pin Code"
              name={`educational_details.${index}.pin`}
              register={register}
              error={errors.educational_details?.[index]?.pin}
              required
            />

            <FormInput
              label="University/Board"
              name={`educational_details.${index}.university`}
              register={register}
              error={errors.educational_details?.[index]?.university}
              required
            />
            <FormInput
              label="University Address"
              name={`educational_details.${index}.universityAddress`}
              register={register}
              error={errors.educational_details?.[index]?.universityAddress}
            />
            <div className="flex gap-4">
              <FormInput
                label="University State"
                name={`educational_details.${index}.universitystate`}
                register={register}
                error={errors.educational_details?.[index]?.universitystate}
              />
              <FormInput
                label="University Pin"
                name={`educational_details.${index}.universitypin`}
                register={register}
                error={errors.educational_details?.[index]?.universitypin}
              />
            </div>

            <FormInput
              label="Roll No"
              name={`educational_details.${index}.rollNo`}
              register={register}
              error={errors.educational_details?.[index]?.rollNo}
              required
            />
            <FormInput
              label="Enrollment No"
              name={`educational_details.${index}.enrollmentNo`}
              register={register}
              error={errors.educational_details?.[index]?.enrollmentNo}
            />
            <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-4 p-4  bg-white rounded border border-gray-200">

                  <div className="flex items-center">
                    <label className="font-bold text-gray-700 mr-2 whitespace-nowrap">Duration</label>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <FormInput
                      label="Start Date"
                      type="date"
                      name={`educational_details.${index}.startDate`}
                      register={register}
                      error={errors.educational_details?.[index]?.startDate}
                      required
                    />
                    <FormInput
                      label="End Date"
                      type="date"
                      name={`educational_details.${index}.endDate`}
                      register={register}
                      error={errors.educational_details?.[index]?.endDate}
                      required
                    />
                  </div>
              </div>

         

            <FormSelect
              label="Status"
              name={`educational_details.${index}.status`}
              options={["Completed", "Pursuing", "Dropped"]}
              register={register}
              error={errors.educational_details?.[index]?.status}
              required
            />

            <FormInput
              label="Marks % / CGPA"
              name={`educational_details.${index}.marks`}
              register={register}
              error={errors.educational_details?.[index]?.marks}
              required
            />

            <FormSelect
              label="Education Type"
              name={`educational_details.${index}.educationType`}
              options={["Regular", "Correspondence", "Part Time"]}
              register={register}
              error={errors.educational_details?.[index]?.educationType}
              required
            />

            <FormInput
              label="Any Other (Hall Ticket No etc)"
              name={`educational_details.${index}.anyOther`}
              register={register}
              error={errors.educational_details?.[index]?.anyOther}
            />
            <div className="mt-6">
              <FormInput
                label="Documents Attached (Description)"
                name={`educational_details.${index}.documentsAttached`}
                register={register}
                error={errors.educational_details?.[index]?.documentsAttached}
              />
            </div>
          </div>

          <div className="mt-6">
            <FormTextArea
              label="SIGNIFICANT ACHIEVEMENTS / OTHER COURSES / DIPLOMA COMPLETED: (Please mention Institute name / Year of completion / Duration)"
              name={`educational_details.${index}.achievements`}
              register={register}
              error={errors.educational_details?.[index]?.achievements}
            />
          </div>
        </div>
      ))}
    </FormSection>
  );
};

export default EducationDetails;
