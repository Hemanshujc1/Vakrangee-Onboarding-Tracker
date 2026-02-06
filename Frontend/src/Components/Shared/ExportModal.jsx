import React, { useState, useEffect } from "react";
import { X, Download, FileSpreadsheet, FileText, Filter } from "lucide-react";
import EmployeeFilters from "./EmployeeFilters";
import { getEmployeeStatus, getUniqueOptions } from "../../utils/employeeUtils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ExportModal = ({ isOpen, onClose, data, formatOptions = {}, fileName = "export", filterProps = {}, options = {} }) => {
  if (!isOpen) return null;

  // Local Filter States
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isFieldsOpen, setIsFieldsOpen] = useState(false);
  const [filteredData, setFilteredData] = useState(data);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterJobTitle, setFilterJobTitle] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterAssignedHR, setFilterAssignedHR] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Field Selection
  const allFields = Object.keys(formatOptions).length > 0 ? Object.keys(formatOptions) : Object.keys(data[0] || {});
  const [selectedFields, setSelectedFields] = useState(allFields);

  // Format Selection
  const [exportFormat, setExportFormat] = useState("csv"); // 'csv' or 'pdf'

  // Extract Options for Filters
  const departments = getUniqueOptions(data, "department");
  const jobTitles = getUniqueOptions(data, "jobTitle");
  const locations = getUniqueOptions(data, "location");
  // Use passed hrOptions or default to empty
  const hrOptions = options.hrOptions || [];
  const statuses = options.statuses || ["Login Pending", "Profile Pending", "In Progress", "Ready to Join", "Joining Formalities", "Completed"];

  // Apply Filters Effect
  useEffect(() => {
    let result = data;

    // Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(item => 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(lowerTerm)
        )
      );
    }

    // Filters
    if (filterStatus) {
         result = result.filter(item => {
             const itemStatus = item.status || getEmployeeStatus(item);
             return itemStatus === filterStatus || item.accountStatus === filterStatus;
         });
    }
    if (filterDepartment) result = result.filter(item => item.department === filterDepartment);
    if (filterJobTitle) result = result.filter(item => item.jobTitle === filterJobTitle);
    if (filterLocation) result = result.filter(item => item.location === filterLocation);
    if (filterAssignedHR) {
        if (filterAssignedHR === "Not Assigned") {
            result = result.filter(item => !item.assignedHRName || item.assignedHRName === '-');
        } else {
            result = result.filter(item => item.assignedHRName === filterAssignedHR);
        }
    }

    // Sort
    if (sortConfig.key) {
        result = [...result].sort((a, b) => { // Create a copy before sorting
            const aVal = a[sortConfig.key] || "";
            const bVal = b[sortConfig.key] || "";
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    setFilteredData(result);
  }, [data, searchTerm, filterStatus, filterDepartment, filterJobTitle, filterLocation, filterAssignedHR, sortConfig]);

  const handleFieldToggle = (field) => {
    setSelectedFields(prev => 
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const handleSelectAll = (e) => {
      setSelectedFields(e.target.checked ? allFields : []);
  }

  const handleExport = () => {
    if (exportFormat === "csv") {
        exportToCSV();
    } else {
        exportToPDF();
    }
  };

  const exportToCSV = () => {
    const headers = selectedFields.map(field => formatOptions[field] || field).join(",");
    const rows = filteredData.map(item => 
      selectedFields.map(field => {
        let val = item[field];
        if (val === null || val === undefined) val = "";
        // Handle special cases like status if needed, assuming simple data for now or pre-processed
        // Escape quotes
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",")
    );

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    const tableColumns = selectedFields.map(field => ({
        header: formatOptions[field] || field,
        dataKey: field
    }));

    const tableRows = filteredData.map(item => {
        const row = {};
        selectedFields.forEach(field => {
            let val = item[field];
            if (val === null || val === undefined) val = "-";
            row[field] = String(val);
        });
        return row;
    });

    doc.text(`Export: ${fileName}`, 14, 15);
    doc.text(`Total Records: ${filteredData.length}`, 14, 22);

    autoTable(doc, {
        startY: 30,
        columns: tableColumns,
        body: tableRows,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [63, 81, 181] } 
    });

    doc.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

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
            <p className="text-sm text-gray-500 mt-1">Filter data and select fields to export.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
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
                
                <div className={`bg-gray-50 border border-gray-200 rounded-xl transition-all duration-300 overflow-hidden ${isFiltersOpen ? 'p-4' : 'max-h-0 border-0'}`}>
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
                                status: filterStatus, setStatus: setFilterStatus,
                                department: filterDepartment, setDepartment: setFilterDepartment,
                                jobTitle: filterJobTitle, setJobTitle: setFilterJobTitle,
                                location: filterLocation, setLocation: setFilterLocation,
                                assignedHR: filterAssignedHR, setAssignedHR: setFilterAssignedHR,
                                sortConfig, setSortConfig,
                                resetFilters: () => {
                                    setFilterStatus("");
                                    setFilterDepartment("");
                                    setFilterJobTitle("");
                                    setFilterLocation("");
                                    setFilterAssignedHR("");
                                    setSearchTerm("");
                                    setSortConfig({ key: null, direction: 'asc' });
                                }
                            }}
                            options={{ statuses, departments, jobTitles, locations, hrOptions }}
                            variant="full"
                            {...filterProps}
                        />
                       </>
                   )}
                </div>
                {!isFiltersOpen && (
                    <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 inline-block">
                        {searchTerm || filterStatus || filterDepartment || filterJobTitle || filterLocation || filterAssignedHR 
                            ? "Filters applied." 
                            : "No filters applied."}
                    </div>
                )}
            </section>

            <div className="flex flex-col gap-8">
                {/* 2. Select Fields */}
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

                    <div className={`bg-gray-50 border border-gray-200 rounded-xl transition-all duration-300 overflow-hidden ${isFieldsOpen ? 'p-4' : 'max-h-0 border-0'}`}>
                         <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                             <span className="text-sm text-gray-600 font-medium">Select columns to include</span>
                            <label className="flex items-center gap-2 text-sm text-blue-600 cursor-pointer hover:underline">
                                <input type="checkbox" onChange={handleSelectAll} checked={selectedFields.length === allFields.length} className="accent-blue-600" />
                                Select All
                            </label>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                            {allFields.map(field => (
                                <label key={field} className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 p-2 rounded cursor-pointer transition-colors bg-white border border-gray-100">
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

                {/* 3. Export Format */}
                <section>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">3. Export Format</h3>
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
