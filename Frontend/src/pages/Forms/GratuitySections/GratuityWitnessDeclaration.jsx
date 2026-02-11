import { React } from "../../../utils/formDependencies";

const GratuityWitnessDeclaration = ({ witnessFields, register, errors }) => (
  <div>
    <h3 className="font-bold text-center uppercase mb-6 text-lg border-b border-gray-300 pb-2 pt-2">
      Declaration by Witnesses <span className="text-red-500">*</span>
    </h3>
    <p className="mb-4 font-medium">
      Nomination signed/thumb-impressed before me.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {witnessFields.map((field, index) => (
        <div
          key={field.id}
          className="space-y-3 p-4 border border-gray-200 rounded"
        >
          <h4 className="font-bold underline">Witness {index + 1}</h4>
          <div>
            <input
              {...register(`witnesses.${index}.name`)}
              placeholder="Name in full"
              className="w-full border-b border-gray-300 py-1 outline-none bg-transparent"
            />
            {errors.witnesses?.[index]?.name && (
              <span className="text-red-500 text-xs">Required</span>
            )}
          </div>
          <div>
            <textarea
              {...register(`witnesses.${index}.address`)}
              placeholder="Full Address"
              className="w-full border border-gray-300 p-2 text-xs resize-none h-20 outline-none bg-transparent"
            />
            {errors.witnesses?.[index]?.address && (
              <span className="text-red-500 text-xs">Required</span>
            )}
          </div>
          <div className="flex justify-between items-end mt-2">
            <div className="h-8 border-b border-dotted border-gray-400 text-gray-400 text-xs flex items-end w-32">
              Signature
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-6 flex flex-col md:flex-row gap-8">
      <div className="flex-1">
        <label className="font-bold mr-2">Place:</label>
        <input
          {...register("witnesses_place")}
          className="border-b border-black outline-none px-2 bg-transparent"
          placeholder="Place"
        />
        {errors.witnesses_place && (
          <span className="text-red-500 text-xs">Required</span>
        )}
      </div>
      <div className="flex-1">
        <label className="font-bold mr-2">Date:</label>
        <input
          type="date"
          {...register("witnesses_date")}
          className="border-b border-black outline-none px-2 bg-transparent"
        />
        {errors.witnesses_date && (
          <span className="text-red-500 text-xs">Required</span>
        )}
      </div>
    </div>
  </div>
);

export default GratuityWitnessDeclaration;
