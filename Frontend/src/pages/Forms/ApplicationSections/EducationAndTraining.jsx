import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import { DynamicTable, TableInput, AddButton } from "../../../Components/Forms/Shared";

const EducationAndTraining = ({ register, errors, control, educationFields, appendEdu, removeEdu, trainingFields, appendTraining, removeTraining, achievementFields, appendAchievement, removeAchievement }) => {
  return (
    <>
      {/* Education */}
      <FormSection title="Educational & Professional Qualifications" isRequired="true">
        <DynamicTable
          headers={[
            "Qualification",
            "University/Institute",
            "Year of Passing",
            "% Marks",
            "Location",
          ]}
          fields={educationFields}
          onRemove={removeEdu}
          renderRow={(item, index) => (
            <>
              <TableInput
                register={register(`education.${index}.qualification`)}
                placeholder="e.g. B.Tech"
                error={errors.education?.[index]?.qualification}
                required
              />
              <TableInput
                register={register(`education.${index}.institute`)}
                error={errors.education?.[index]?.institute}
                required
              />
              <TableInput
                register={register(`education.${index}.year`)}
                type="number"
                error={errors.education?.[index]?.year}
                required
              />
              <TableInput
                register={register(`education.${index}.percentage`)}
                error={errors.education?.[index]?.percentage}
                required
              />
              <TableInput register={register(`education.${index}.location`)} />
            </>
          )}
        />
        <AddButton
          onClick={() =>
            appendEdu({
              qualification: "",
              institute: "",
              year: "",
              percentage: "",
              location: "",
            })
          }
          label="Add Qualification"
          disabled={educationFields.length >= 5}
        />
        {educationFields.length >= 5 && <p className="text-xs text-red-500 mt-1">Maximum 5 entries allowed.</p>}
      </FormSection>

      {/* Other Training */}
      <FormSection title="Mention if any other IT certifications & qualification acquired or training programmes attended:">
        <DynamicTable
          headers={[
            "Institute / Organization",
            "Location",
            "Duration",
            "Details of Training",
          ]}
          fields={trainingFields}
          onRemove={removeTraining}
          renderRow={(item, index) => (
            <>
              <TableInput
                register={register(`otherTraining.${index}.institute`)}
              />
              <TableInput
                register={register(`otherTraining.${index}.location`)}
              />
              <TableInput
                register={register(`otherTraining.${index}.duration`)}
              />
              <TableInput
                register={register(`otherTraining.${index}.details`)}
              />
            </>
          )}
        />
        <AddButton
          onClick={() =>
            appendTraining({
              institute: "",
              location: "",
              duration: "",
              details: "",
            })
          }
          label="Add Training"
          disabled={trainingFields.length >= 4}
        />
        {trainingFields.length >= 4 && <p className="text-xs text-red-500 mt-1">Maximum 4 entries allowed.</p>}
      </FormSection>

      {/* Achievements */}
      <FormSection title="Significant Achievements">
        <p className="mb-5">
          Distinction, honors, awards (Academic / extracurricular, Community /
          Welfare activities) received.
        </p>
        <DynamicTable
          headers={["Year", "Distinction / Honors / Awards"]}
          fields={achievementFields}
          onRemove={removeAchievement}
          colWidths={["20%", "75%"]}
          renderRow={(item, index) => (
            <>
              <TableInput 
                register={register(`achievements.${index}.year`)} 
                type="number"
                error={errors.achievements?.[index]?.year}
              />
              <TableInput
                register={register(`achievements.${index}.details`)}
                error={errors.achievements?.[index]?.details}
              />
            </>
          )}
        />
        <AddButton
          onClick={() => appendAchievement({ year: "", details: "" })}
          label="Add Achievement"
          disabled={achievementFields.length >= 4}
        />
        {achievementFields.length >= 4 && <p className="text-xs text-red-500 mt-1">Maximum 4 entries allowed.</p>}

      </FormSection>
    </>
  );
};

export default EducationAndTraining;
