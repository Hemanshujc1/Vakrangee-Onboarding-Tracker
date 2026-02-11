import {
  React,
  DynamicTable,
  AddButton,
} from "../../../utils/formDependencies";

const GratuityNomineeStatement = ({
  register,
  watch,
  nomineeFields,
  removeNominee,
  appendNominee,
  errors,
}) => (
  <>
    <div className="text-justify m-5">
      <div className="mb-4">
        I, Shri/Shrimati/Kumari{" "}
        <span className="border-b border-black px-2 font-bold uppercase inline-block min-w-[16rem]">
          {[watch("firstname"), watch("middlename"), watch("lastname")]
            .filter(Boolean)
            .join(" ")}
        </span>
        <span className="text-xs text-gray-500 block mt-1 text-center">
          (Name in full here)
        </span>
      </div>
      <p>
        whose particulars are given in the statement below, hereby nominate the
        person(s) mentioned below to receive the gratuity payable after my death
        as also the gratuity standing to my credit in the event of my death
        before that amount has become payable, or having become payable has not
        been paid and direct that the said amount of gratuity shall be paid in
        proportion indicated against the name(s) of the nominee(s).
      </p>
    </div>

    <div className="space-y-2 text-justify">
      <div className="flex gap-2">
        <span>2.</span>
        <p>
          I hereby certify that the person(s) mentioned is/are a member(s) of my
          family within the meaning of clause (h) of Section 2 of the Payment of
          Gratuity Act, 1972.
        </p>
      </div>
      <div className="flex gap-2">
        <span>3.</span>
        <p>
          I hereby declare that I have no family within the meaning of clause
          (h) of Section 2 of the said Act.
        </p>
      </div>
      <div className="flex gap-2">
        <span>4.</span>
        <div className="space-y-1">
          <p>(a) My father/mother/parents is/are not dependent on me.</p>
          <p>
            (b) My husband's father/mother/parents is/are not dependent on my
            husband.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <span>5.</span>
        <p>
          I have excluded my husband from my family by a notice dated the{" "}
          <input
            className="border-b border-black w-32 cursor-not-allowed"
            disabled
            type="date"
          />{" "}
          to the controlling authority in terms of the proviso to clause (h) of
          Section 2 of the said Act.
        </p>
      </div>
      <div className="flex gap-2">
        <span>6.</span>
        <p>Nomination made herein invalidates my previous nomination.</p>
      </div>
    </div>

    <div className="mt-8">
      <h3 className="font-bold text-center uppercase mb-4 text-lg">
        Nominee(s)
      </h3>

      <DynamicTable
        headers={[
          "Name in full with full address of nominee(s)",
          "Relationship with the employee",
          "Age of nominee",
          "Proportion by which the gratuity will be shared",
        ]}
        fields={nomineeFields}
        onRemove={removeNominee}
        renderRow={(item, index) => (
          <>
            <td className="border border-gray-300 p-1 align-top">
              <input
                {...register(`nominees.${index}.name`)}
                placeholder="Full Name"
                className={`w-full border-b border-gray-300 outline-none p-1 mb-1 bg-transparent ${
                  errors.nominees?.[index]?.name ? "bg-red-50" : ""
                }`}
              />
              {errors.nominees?.[index]?.name && (
                <span className="text-red-500 text-xs block px-1">
                  {errors.nominees[index].name.message}
                </span>
              )}

              <textarea
                {...register(`nominees.${index}.address`)}
                placeholder="Full Address"
                className={`w-full border border-gray-200 outline-none p-1 text-xs h-16 resize-none mt-1 ${
                  errors.nominees?.[index]?.address ? "bg-red-50" : ""
                }`}
              />
              {errors.nominees?.[index]?.address && (
                <span className="text-red-500 text-xs block px-1">
                  {errors.nominees[index].address.message}
                </span>
              )}
            </td>
            <td className="border border-gray-300 p-1 align-top">
              <input
                {...register(`nominees.${index}.relationship`)}
                placeholder="e.g. Spouse"
                className={`w-full outline-none p-1 bg-transparent ${
                  errors.nominees?.[index]?.relationship ? "bg-red-50" : ""
                }`}
              />
              {errors.nominees?.[index]?.relationship && (
                <span className="text-red-500 text-xs block px-1">
                  {errors.nominees[index].relationship.message}
                </span>
              )}
            </td>
            <td className="border border-gray-300 p-1 align-top">
              <input
                type="number"
                {...register(`nominees.${index}.age`)}
                placeholder="Age"
                className={`w-full outline-none p-1 bg-transparent ${
                  errors.nominees?.[index]?.age ? "bg-red-50" : ""
                }`}
              />
              {errors.nominees?.[index]?.age && (
                <span className="text-red-500 text-xs block px-1">
                  {errors.nominees[index].age.message}
                </span>
              )}
            </td>
            <td className="border border-gray-300 p-1 align-top">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  {...register(`nominees.${index}.share`)}
                  placeholder="%"
                  className={`w-full outline-none p-1 bg-transparent ${
                    errors.nominees?.[index]?.share ? "bg-red-50" : ""
                  }`}
                />
                <span>%</span>
              </div>
              {errors.nominees?.[index]?.share && (
                <span className="text-red-500 text-xs block px-1">
                  {errors.nominees[index].share.message}
                </span>
              )}
            </td>
          </>
        )}
      />
      <AddButton
        onClick={() =>
          appendNominee({
            name: "",
            address: "",
            relationship: "",
            age: "",
            share: "",
          })
        }
        label="Add Nominee"
      />
    </div>
  </>
);

export default GratuityNomineeStatement;
