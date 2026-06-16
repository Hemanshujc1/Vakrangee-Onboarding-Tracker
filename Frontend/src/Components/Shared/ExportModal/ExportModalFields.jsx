import React from "react";

const ExportModalFields = ({
  isFieldsOpen,
  setIsFieldsOpen,
  allFields,
  selectedFields,
  handleFieldToggle,
  handleSelectAll,
  formatOptions,
}) => {
  return (
    <section>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          2. Select Fields
        </h3>
        <button
          onClick={() => setIsFieldsOpen(!isFieldsOpen)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          {isFieldsOpen ? "Hide Fields" : "Show Fields"}
        </button>
      </div>

      <div
        className={`bg-gray-50 border border-gray-200 rounded-xl transition-all duration-300 overflow-hidden ${
          isFieldsOpen ? "p-4" : "max-h-0 border-0"
        }`}
      >
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
          <span className="text-sm text-gray-600 font-medium">
            Select columns to include
          </span>
          <label className="flex items-center gap-2 text-sm text-blue-600 cursor-pointer hover:underline">
            <input
              type="checkbox"
              onChange={handleSelectAll}
              checked={selectedFields.length === allFields.length}
              className="accent-blue-600"
            />
            Select All
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {allFields.map((field) => (
            <label
              key={field}
              className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 p-2 rounded cursor-pointer transition-colors bg-white border border-gray-100"
            >
              <input
                type="checkbox"
                checked={selectedFields.includes(field)}
                onChange={() => handleFieldToggle(field)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {formatOptions[field] || field}
            </label>
          ))}
        </div>
      </div>
      {!isFieldsOpen && (
        <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 inline-block">
          {selectedFields.length} of {allFields.length} fields selected.
        </div>
      )}
    </section>
  );
};

export default ExportModalFields;
