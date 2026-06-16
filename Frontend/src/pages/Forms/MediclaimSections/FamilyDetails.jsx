import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import {
  DynamicTable,
  TableInput,
  AddButton,
} from "../../../Components/Forms/Shared";

const FamilyDetails = ({ register, errors, fields, remove, append }) => {
  return (
    <FormSection title="Family Details / Dependents" isRequired="true">
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
                {/* <option value="Mother">Mother</option>
                            <option value="Father">Father</option> */}
              </select>
              {errors.dependents?.[index]?.relationship && (
                <span className="text-red-500 text-xs block px-1">
                  {errors.dependents[index].relationship.message}
                </span>
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
        <AddButton
          onClick={() =>
            append({ relationship: "Spouse", name: "", age: "", dob: "" })
          }
          label="Add Dependent"
        />
      </div>
      {errors.dependents && typeof errors.dependents.message === "string" && (
        <p className="text-red-500 text-sm mt-1">{errors.dependents.message}</p>
      )}
    </FormSection>
  );
};

export default FamilyDetails;
