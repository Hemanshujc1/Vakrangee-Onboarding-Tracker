import { useState, useEffect } from "react";
import { getEmployeeStatus, getUniqueOptions } from "../../../utils/employeeUtils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const useExportModal = ({ data, formatOptions, fileName, options }) => {
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
        result = [...result].sort((a, b) => { 
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

  const exportToCSV = () => {
    const headers = selectedFields.map(field => formatOptions[field] || field).join(",");
    const rows = filteredData.map(item => 
      selectedFields.map(field => {
        let val = item[field];
        if (val === null || val === undefined) val = "";
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

  const handleExport = () => {
    if (exportFormat === "csv") {
        exportToCSV();
    } else {
        exportToPDF();
    }
  };

  const resetFilters = () => {
    setFilterStatus("");
    setFilterDepartment("");
    setFilterJobTitle("");
    setFilterLocation("");
    setFilterAssignedHR("");
    setSearchTerm("");
    setSortConfig({ key: null, direction: 'asc' });
  };

  return {
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
  };
};
