import React from "react";

const TaxRegimeSelection = ({ register, errors }) => {
  return (
    <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Select Tax Regime
      </h2>
      <div className="flex gap-8">
        <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg shadow-sm border hover:border-blue-400 transition-colors w-full sm:w-auto">
          <input
            type="radio"
            value="new"
            {...register("tax_regime")}
            className="w-5 h-5 text-blue-600 focus:ring-blue-500"
          />
          <span className="font-medium text-gray-700">New Tax Regime</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg shadow-sm border hover:border-blue-400 transition-colors w-full sm:w-auto">
          <input
            type="radio"
            value="old"
            {...register("tax_regime")}
            className="w-5 h-5 text-blue-600 focus:ring-blue-500"
          />
          <span className="font-medium text-gray-700">Old Tax Regime</span>
        </label>
      </div>
      {errors.tax_regime && (
        <p className="text-red-500 text-sm mt-2">{errors.tax_regime.message}</p>
      )}
    </div>
  );
};

export default TaxRegimeSelection;
