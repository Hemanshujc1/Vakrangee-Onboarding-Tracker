import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";

const ReferenceDetails = ({ register, errors, refFields }) => {
  return (
    <FormSection title="References (Two )">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {refFields.map((item, index) => (
        <div key={item.id} className="border p-6 rounded relative bg-white shadow-sm">
          <div className="font-bold mb-4 text-blue-800 border-b pb-2">Reference #{index + 1}</div>
          <div className="space-y-4">
            <FormInput
              label="Name"
              name={`references.${index}.name`}
              register={register}
              error={errors.references?.[index]?.name}
              
            />
            <FormInput
              label="Address"
              name={`references.${index}.address`}
              register={register}
              error={errors.references?.[index]?.address}
              
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Mobile"
                name={`references.${index}.mob`}
                register={register}
                error={errors.references?.[index]?.mob}
                
              />
              <FormInput
                label="Telephone"
                name={`references.${index}.tel`}
                register={register}
                error={errors.references?.[index]?.tel}
              />
            </div>
            <FormInput
              label="Email"
              name={`references.${index}.email`}
              register={register}
              error={errors.references?.[index]?.email}
              
            />
            <FormInput
              label="Designation"
              name={`references.${index}.designation`}
              register={register}
              error={errors.references?.[index]?.designation}
              
            />
          </div>
        </div>
      ))}
    </div>
  </FormSection>
  );
};

export default ReferenceDetails;
      
