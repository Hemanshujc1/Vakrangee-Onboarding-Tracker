import React from "react";
import { X, Download, Filter } from "lucide-react";
import EmployeeFilters from "./EmployeeFilters";
import { useExportModal } from "./hooks/useExportModal";
import ExportModalFields from "./ExportModal/ExportModalFields";
import ExportModalFormats from "./ExportModal/ExportModalFormats";

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
