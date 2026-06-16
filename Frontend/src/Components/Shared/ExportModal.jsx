import React from "react";
import { X, Download, Filter, FileSpreadsheet, FileText } from "lucide-react";
import EmployeeFilters from "./EmployeeFilters";
import { useExportModal } from "./useExportModal";

// --- Fields Section ---
const ExportModalFields = ({
  isFieldsOpen,
  setIsFieldsOpen,
  allFields,
  selectedFields,
  handleFieldToggle,
  handleSelectAll,
  formatOptions,
}) => (
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

// --- Format Section ---
const ExportModalFormats = ({ exportFormat, setExportFormat }) => (
  <section>
    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
      3. Export Format
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => setExportFormat("csv")}
        className={`flex align-middle items-center justify-center p-2 rounded-xl border-2 transition-all ${
          exportFormat === "csv"
            ? "border-green-500 bg-green-50 text-green-700"
            : "border-gray-200 hover:border-green-200 hover:bg-gray-50 text-gray-600"
        }`}
      >
        <FileSpreadsheet size={24} className="mb-2" />
        <span className="font-semibold">CSV</span>
      </button>
      <button
        onClick={() => setExportFormat("pdf")}
        className={`flex align-middle items-center justify-center p-2 rounded-xl border-2 transition-all ${
          exportFormat === "pdf"
            ? "border-red-500 bg-red-50 text-red-700"
            : "border-gray-200 hover:border-red-200 hover:bg-gray-50 text-gray-600"
        }`}
      >
        <FileText size={24} className="mb-2" />
        <span className="font-semibold">PDF</span>
      </button>
    </div>
  </section>
);

// --- Main Modal ---
const ExportModal = ({
  isOpen,
  onClose,
  data,
  formatOptions = {},
  fileName = "export",
  filterProps = {},
  options = {},
}) => {
  if (!isOpen) return null;

  const {
    isFiltersOpen,
    setIsFiltersOpen,
    isFieldsOpen,
    setIsFieldsOpen,
    filteredData,
    filterStatus,
    setFilterStatus,
    filterDepartment,
    setFilterDepartment,
    filterJobTitle,
    setFilterJobTitle,
    filterLocation,
    setFilterLocation,
    filterAssignedHR,
    setFilterAssignedHR,
    searchTerm,
    setSearchTerm,
    sortConfig,
    setSortConfig,
    allFields,
    selectedFields,
    exportFormat,
    setExportFormat,
    departments,
    jobTitles,
    locations,
    hrOptions,
    statuses,
    handleFieldToggle,
    handleSelectAll,
    handleExport,
    resetFilters,
  } = useExportModal({ data, formatOptions, fileName, options });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Download size={20} className="text-(--color-primary)" />
              Export Data
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Filter data and select fields to export.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:hidden">
          {/* 1. Filter Section */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                1. Filter Records ({filteredData.length} found)
              </h3>
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                <Filter size={16} />
                {isFiltersOpen ? "Hide Filters" : "Show Filters"}
              </button>
            </div>

            <div
              className={`bg-gray-50 border border-gray-200 rounded-xl transition-all duration-300 overflow-hidden ${
                isFiltersOpen ? "p-4" : "max-h-0 border-0"
              }`}
            >
              {isFiltersOpen && (
                <>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Search within export..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                    />
                  </div>

                  <EmployeeFilters
                    filters={{
                      status: filterStatus,
                      setStatus: setFilterStatus,
                      department: filterDepartment,
                      setDepartment: setFilterDepartment,
                      jobTitle: filterJobTitle,
                      setJobTitle: setFilterJobTitle,
                      location: filterLocation,
                      setLocation: setFilterLocation,
                      assignedHR: filterAssignedHR,
                      setAssignedHR: setFilterAssignedHR,
                      resetFilters,
                    }}
                    options={{
                      statuses,
                      departments,
                      jobTitles,
                      locations,
                      hrOptions,
                    }}
                    sortConfig={sortConfig}
                    setSortConfig={setSortConfig}
                    variant="full"
                    {...filterProps}
                  />
                </>
              )}
            </div>
            {!isFiltersOpen && (
              <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 inline-block">
                {searchTerm ||
                filterStatus ||
                filterDepartment ||
                filterJobTitle ||
                filterLocation ||
                filterAssignedHR
                  ? "Filters applied."
                  : "No filters applied."}
              </div>
            )}
          </section>

          <div className="flex flex-col gap-8">
            <ExportModalFields
              isFieldsOpen={isFieldsOpen}
              setIsFieldsOpen={setIsFieldsOpen}
              allFields={allFields}
              selectedFields={selectedFields}
              handleFieldToggle={handleFieldToggle}
              handleSelectAll={handleSelectAll}
              formatOptions={formatOptions}
            />

            <ExportModalFormats
              exportFormat={exportFormat}
              setExportFormat={setExportFormat}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-end gap-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors text-center"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={selectedFields.length === 0}
            className={`w-full sm:w-auto px-6 py-2.5 text-white font-medium rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all ${
              selectedFields.length === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-(--color-primary) hover:brightness-110 active:scale-95"
            }`}
          >
            <Download size={18} />
            Download {exportFormat.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
