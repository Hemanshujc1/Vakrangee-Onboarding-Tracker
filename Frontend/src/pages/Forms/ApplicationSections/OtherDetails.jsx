import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormTextArea from "../../../Components/Forms/FormTextArea";
import { DynamicTable, TableInput, AddButton } from "../../../Components/Forms/Shared";
import { Trash2 } from "lucide-react";

const OtherDetails = ({ register, errors, languageFields, appendLang, removeLang, familyFields, appendFamily, removeFamily, referenceFields, appendRef, removeRef }) => {
  return (
    <>
      {/* Family Details */}
      <FormSection title="Family Details">
        <DynamicTable
          headers={["Relationship", "Name", "Age", "Occupation"]}
          fields={familyFields}
          onRemove={removeFamily}
          renderRow={(item, index) => (
            <>
              <TableInput
                register={register(`family.${index}.relationship`)}
                placeholder="e.g. Father"
                error={errors.family?.[index]?.relationship}
                required
              />
              <TableInput 
                register={register(`family.${index}.name`)} 
                error={errors.family?.[index]?.name} 
                required
              />
              <TableInput
                register={register(`family.${index}.age`)}
                type="number"
                error={errors.family?.[index]?.age}
                required
              />
              <TableInput register={register(`family.${index}.occupation`)} />
            </>
          )}
        />
        <AddButton
          onClick={() =>
            appendFamily({
              relationship: "",
              name: "",
              age: "",
              occupation: "",
            })
          }
          label="Add Family Member"
        />
      </FormSection>

      {/* Habits */}
      <FormSection title="Do you have following habits:">
        <div className="flex gap-8 border p-4 rounded">
          <div className="flex items-center gap-2">
            <span className="font-bold">Smoking:</span>
            <label>
              <input type="radio" value="Yes" {...register("smoking")} /> Yes
            </label>
            <label>
              <input type="radio" value="No" {...register("smoking")} /> No
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">Chewing Tobacco:</span>
            <label>
              <input type="radio" value="Yes" {...register("tobacco")} /> Yes
            </label>
            <label>
              <input type="radio" value="No" {...register("tobacco")} /> No
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">Drinking Liquor:</span>
            <label>
              <input type="radio" value="Yes" {...register("liquor")} /> Yes
            </label>
            <label>
              <input type="radio" value="No" {...register("liquor")} /> No
            </label>
          </div>
        </div>
      </FormSection>

      {/* Languages */}
      <FormSection title="Languages Known">
        <div className="overflow-x-auto mb-2">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">
                  Language
                </th>
                <th className="border border-gray-300 p-2 text-center w-[15%]">
                  Speak
                </th>
                <th className="border border-gray-300 p-2 text-center w-[15%]">
                  Read
                </th>
                <th className="border border-gray-300 p-2 text-center w-[15%]">
                  Write
                </th>
                <th className="border border-gray-300 p-2 w-[5%]"></th>
              </tr>
            </thead>
            <tbody>
              {languageFields.map((item, index) => (
                <tr key={item.id}>
                  <TableInput
                    register={register(`languages.${index}.language`)}
                    error={errors.languages?.[index]?.language}
                    required
                  />
                  <td className="border border-gray-300 p-2 text-center align-middle">
                    <input
                      type="checkbox"
                      {...register(`languages.${index}.speak`)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center align-middle">
                    <input
                      type="checkbox"
                      {...register(`languages.${index}.read`)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center align-middle">
                    <input
                      type="checkbox"
                      {...register(`languages.${index}.write`)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center align-middle">
                    <button
                      type="button"
                      onClick={() => removeLang(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AddButton
          onClick={() =>
            appendLang({
              language: "",
              speak: false,
              read: false,
              write: false,
            })
          }
          label="Add Language"
          disabled={languageFields.length >= 4}
        />
        {languageFields.length >= 4 && <p className="text-xs text-red-500 mt-1">Maximum 4 entries allowed.</p>}
      </FormSection>

      {/* References */}
      <FormSection title="Please list two professional references other than relatives.">
        <DynamicTable
          headers={[
            "Name",
            "Position",
            "Company",
            "Address",
            "Contact Details",
          ]}
          fields={referenceFields}
          renderRow={(item, index) => (
            <>
              <TableInput
                register={register(`references.${index}.name`)}
                error={errors.references?.[index]?.name}
              />
              <TableInput register={register(`references.${index}.position`)} />
              <TableInput
                register={register(`references.${index}.company`)}
                error={errors.references?.[index]?.company}
              />
              <TableInput register={register(`references.${index}.address`)} />
              <TableInput
                register={register(`references.${index}.contact`)}
                error={errors.references?.[index]?.contact}
              />
            </>
          )}
        />
        <p className="text-xs text-gray-500 mt-2">
           *Please list two professional references other than relatives.
        </p>
      </FormSection>

      {/* Questionnaire */}
      <FormSection title="General Questionnaire">
        <FormTextArea
          label="a) What are your career objectives & personal goals? Ideally, how would you like to see them develop over the next 5 Years."
          register={register}
          name="careerObjectives"
        />
        <FormTextArea
          label="b) Major achievements"
          register={register}
          name="majorAchievements"
        />
        <FormTextArea
          label="c) Physical or mental disability, if any"
          register={register}
          name="disability"
        />
        <FormTextArea
          label="d) Have you been interviewed in this organization before? If yes, details."
          register={register}
          name="interviewedBefore"
        />
        <FormTextArea
          label="e) List your hobbies"
          register={register}
          name="hobbies"
        />
        <FormTextArea
          label="f) Have you been convicted for any offence? If yes, details."
          register={register}
          name="conviction"
        />
      </FormSection>
    </>
  );
};

export default OtherDetails;
