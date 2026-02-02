import React from 'react';

const getInputClass = (error, disabled = false) => {
    const baseClass =
      "w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary)";
    const errorClass = error ? "border-red-500" : "border-gray-200";
    const disabledClass = disabled
      ? "cursor-not-allowed bg-gray-50 text-gray-500"
      : "";
    return `${baseClass} ${errorClass} ${disabledClass}`;
};

const PersonalDetailsSection = ({ register, errors, isEditing, formData, formatDate }) => {
  return (
    <>
        <div className="md:col-span-2 mt-4">
            <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2">
            Personal Details
            </h4>
        </div>
        <div>
            <label className="block text-sm text-gray-500 mb-1">
            Employee ID
            </label>
            {isEditing ? (
            <input
                disabled
                value={formData.id || "-"}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            ) : (
            <p className="font-medium text-gray-800 bg-gray-50 px-2 py-2 rounded-md">
                {formData.id || "Not Assigned"}
            </p>
            )}
        </div>
        <div>
            <label className="block text-sm text-gray-500 mb-1">
            First Name
            </label>
            {isEditing ? (
            <>
                <input
                {...register("firstname")}
                disabled
                className={getInputClass(errors.firstname, true)}
                placeholder="Rohit"
                />
                {errors.firstname && (
                <p className="text-red-500 text-xs mt-1">
                    {errors.firstname.message}
                </p>
                )}
            </>
            ) : (
            <p className="font-medium text-gray-800 py-2">
                {formData.firstname || "-"}
            </p>
            )}
        </div>
        <div>
            <label className="block text-sm text-gray-500 mb-1">
            Last Name
            </label>
            {isEditing ? (
            <>
                <input
                {...register("lastname")}
                disabled
                className={getInputClass(errors.lastname, true)}
                placeholder="Sharma"
                />
                {errors.lastname && (
                <p className="text-red-500 text-xs mt-1">
                    {errors.lastname.message}
                </p>
                )}
            </>
            ) : (
            <p className="font-medium text-gray-800 py-2">
                {formData.lastname || "-"}
            </p>
            )}
        </div>
        <div>
            <label className="block text-sm text-gray-500 mb-1">
            Company Email Address
            </label>
            {isEditing ? (
            <>
                <input
                {...register("email")}
                type="email"
                disabled
                placeholder="Not Assigned Yet"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
            </>
            ) : (
            <p className="font-medium text-gray-800 py-2">
                {formData.email || "Not Assigned Yet"}
            </p>
            )}
        </div>
        <div>
            <label className="block text-sm text-gray-500 mb-1">
            Personal Email Address
            </label>
            {isEditing ? (
            <>
                <input
                {...register("personal_email_id")}
                disabled
                type="email"
                className={getInputClass(errors.personal_email_id, true)}
                placeholder="john.doe@gmail.com"
                />
                {errors.personal_email_id && (
                <p className="text-red-500 text-xs mt-1">
                    {errors.personal_email_id.message}
                </p>
                )}
            </>
            ) : (
            <p className="font-medium text-gray-800 py-2">
                {formData.personal_email_id || "-"}
            </p>
            )}
        </div>
        <div>
            <label className="block text-sm text-gray-500 mb-1">
            Phone Number
            </label>
            {isEditing ? (
            <>
                <input
                {...register("phone")}
                type="tel"
                className={getInputClass(errors.phone)}
                placeholder="+91"
                />
                {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                    {errors.phone.message}
                </p>
                )}
            </>
            ) : (
            <p className="font-medium text-gray-800 py-2">
                {formData.phone || "-"}
            </p>
            )}
        </div>
        <div>
            <label className="block text-sm text-gray-500 mb-1">
            Date of Birth
            </label>
            {isEditing ? (
            <>
                <input
                {...register("date_of_birth")}
                type="date"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                    errors.date_of_birth
                    ? "border-red-500"
                    : "border-gray-200"
                }`}
                />
                {errors.date_of_birth && (
                <p className="text-red-500 text-xs mt-1">
                    {errors.date_of_birth.message}
                </p>
                )}
            </>
            ) : (
            <p className="font-medium text-gray-800 py-2">
                {formatDate(formData.date_of_birth) || "-"}
            </p>
            )}
        </div>
        <div>
            <label className="block text-sm text-gray-500 mb-1">Gender</label>
            {isEditing ? (
            <>
                <select
                {...register("gender")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) bg-white ${
                    errors.gender ? "border-red-500" : "border-gray-200"
                }`}
                >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                </select>
                {errors.gender && (
                <p className="text-red-500 text-xs mt-1">
                    {errors.gender.message}
                </p>
                )}
            </>
            ) : (
            <p className="font-medium text-gray-800 py-2">
                {formData.gender || "-"}
            </p>
            )}
        </div>
    </>
  );
};

export default PersonalDetailsSection;
