import React from 'react';

const EducationIdentitySection = ({ register, errors, isEditing, formData }) => {
  return (
    <>
        <div className="md:col-span-2 mt-4">
            <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2">
            Education & Identity
            </h4>
        </div>

        <div>
            <label className="block text-sm text-gray-500 mb-1">
            10th Percentage
            </label>
            {isEditing ? (
            <>
                <input
                {...register("tenth_percentage")}
                type="number"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                    errors.tenth_percentage
                    ? "border-red-500"
                    : "border-gray-200"
                }`}
                />
                {errors.tenth_percentage && (
                <p className="text-red-500 text-xs mt-1">
                    {errors.tenth_percentage.message}
                </p>
                )}
            </>
            ) : (
            <p className="font-medium text-gray-800 py-2">
                {formData.tenth_percentage
                ? `${formData.tenth_percentage}%`
                : "-"}
            </p>
            )}
        </div>
        <div>
            <label className="block text-sm text-gray-500 mb-1">
            12th Percentage
            </label>
            {isEditing ? (
            <>
                <input
                {...register("twelfth_percentage")}
                type="number"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                    errors.twelfth_percentage
                    ? "border-red-500"
                    : "border-gray-200"
                }`}
                />
                {errors.twelfth_percentage && (
                <p className="text-red-500 text-xs mt-1">
                    {errors.twelfth_percentage.message}
                </p>
                )}
            </>
            ) : (
            <p className="font-medium text-gray-800 py-2">
                {formData.twelfth_percentage
                ? `${formData.twelfth_percentage}%`
                : "-"}
            </p>
            )}
        </div>
        <div>
            <label className="block text-sm text-gray-500 mb-1">
            Aadhar Number
            </label>
            {isEditing ? (
            <>
                <input
                {...register("adhar_number")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                    errors.adhar_number ? "border-red-500" : "border-gray-200"
                }`}
                />
                {errors.adhar_number && (
                <p className="text-red-500 text-xs mt-1">
                    {errors.adhar_number.message}
                </p>
                )}
            </>
            ) : (
            <p className="font-medium text-gray-800 py-2">
                {formData.adhar_number || "-"}
            </p>
            )}
        </div>
        <div>
            <label className="block text-sm text-gray-500 mb-1">
            PAN Number
            </label>
            {isEditing ? (
            <>
                <input
                {...register("pan_number")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                    errors.pan_number ? "border-red-500" : "border-gray-200"
                }`}
                />
                {errors.pan_number && (
                <p className="text-red-500 text-xs mt-1">
                    {errors.pan_number.message}
                </p>
                )}
            </>
            ) : (
            <p className="font-medium text-gray-800 py-2">
                {formData.pan_number || "-"}
            </p>
            )}
        </div>
    </>
  );
};

export default EducationIdentitySection;
