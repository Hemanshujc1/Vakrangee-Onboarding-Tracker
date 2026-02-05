import React from "react";

const AddressSection = ({ register, errors, isEditing, fullAddress }) => {
  return (
    <>
      <div className="md:col-span-2 mt-4">
        <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2">
          Permanent Address
        </h4>
      </div>

      {isEditing ? (
        <>
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Address Line 1 <span className='text-red-500'>*</span>
            </label>
            <input
              {...register("address_line1")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                errors.address_line1 ? "border-red-500" : "border-gray-200"
              }`}
              required
            />
            {errors.address_line1 && (
              <p className="text-red-500 text-xs mt-1">
                {errors.address_line1.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Address Line 2 <span className='text-red-500'>*</span>
            </label>
            <input
              {...register("address_line2")}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Landmark</label>
            <input
              {...register("landmark")}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Post Office/Taluka
            </label>
            <input
              {...register("post_office")}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Pincode<span className="text-red-500">*</span></label>
            <input
              {...register("pincode")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                errors.pincode ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.pincode && (
              <p className="text-red-500 text-xs mt-1">
                {errors.pincode.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">City<span className="text-red-500">*</span></label>
            <input
              {...register("city")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                errors.city ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">District<span className="text-red-500">*</span></label>
            <input
              {...register("district")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                errors.district ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.district && (
              <p className="text-red-500 text-xs mt-1">
                {errors.district.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">State<span className="text-red-500">*</span></label>
            <input
              {...register("state")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                errors.state ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.state && (
              <p className="text-red-500 text-xs mt-1">
                {errors.state.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Country<span className="text-red-500">*</span></label>
            <input
              {...register("country")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                errors.country ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.country && (
              <p className="text-red-500 text-xs mt-1">
                {errors.country.message}
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-500 mb-1">
            Full Address
          </label>
          <p className="font-medium text-gray-800 py-2">{fullAddress || "-"}</p>
        </div>
      )}
    </>
  );
};

export default AddressSection;
