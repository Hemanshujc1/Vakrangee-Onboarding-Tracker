import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, CheckSquare, Square, Info, Loader2 } from "lucide-react";
import axios from "axios";
import { useAlert } from "../../context/AlertContext";

const DownloadSelectionModal = ({ isOpen, onClose, employee, documents }) => {
  const { showAlert } = useAlert();
  const [downloading, setDownloading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]); // Array of { id, category, key }

  // 1. Map Available Documents from documents prop
  const availableDocs = (documents || []).map((doc) => ({
    id: doc.id,
    name: doc.document_type,
    fileName: doc.original_name || doc.file_path,
    uploadedAt: doc.uploaded_at || doc.createdAt,
    status: doc.status,
    category: "documents",
    key: doc.document_type,
  }));

  // 2. Map Available Pre-Joining Forms
  const preJoiningFormsList = [
    {
      key: "EMPLOYMENT_APP",
      label: "Application Form",
      statusKey: "applicationStatus",
      idKey: "applicationId",
    },
    {
      key: "DECLARATION",
      label: "Declaration Form",
      statusKey: "declarationStatus",
      idKey: "declarationId",
    },
    {
      key: "MEDICLAIM",
      label: "Mediclaim Form",
      statusKey: "mediclaimStatus",
      idKey: "mediclaimId",
    },
    {
      key: "GRATUITY",
      label: "Gratuity Form (Form F)",
      statusKey: "gratuityStatus",
      idKey: "gratuityId",
    },
  ];

  const availablePreForms = preJoiningFormsList
    .map((form) => {
      const id = employee[form.idKey];
      const status = employee[form.statusKey] || "PENDING";
      return {
        id,
        name: form.label,
        status,
        category: "preJoiningForms",
        key: form.key,
        available: id !== null && id !== undefined && status !== "PENDING",
      };
    })
    .filter((f) => f.available);

  // 3. Map Available Post-Joining Forms
  const postJoiningFormsList = [
    {
      key: "EMPLOYEE_INFO",
      label: "Employee Information Form",
      statusKey: "employeeInfoStatus",
      idKey: "employeeInfoId",
    },
    {
      key: "NDA",
      label: "Non-Disclosure Agreement (NDA)",
      statusKey: "ndaStatus",
      idKey: "ndaId",
    },
    {
      key: "TDS",
      label: "TDS Declaration Form",
      statusKey: "tdsStatus",
      idKey: "tdsId",
    },
    { key: "EPF", label: "EPF Form", statusKey: "epfStatus", idKey: "epfId" },
  ];

  const availablePostForms = postJoiningFormsList
    .map((form) => {
      const id = employee[form.idKey];
      const status = employee[form.statusKey] || "PENDING";
      return {
        id,
        name: form.label,
        status,
        category: "postJoiningForms",
        key: form.key,
        available: id !== null && id !== undefined && status !== "PENDING",
      };
    })
    .filter((f) => f.available);

  // All available downloadable items
  const allDownloadable = [
    ...availableDocs,
    ...availablePreForms,
    ...availablePostForms,
  ];

  // Set default selection: select all available items when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedItems(
        allDownloadable.map((item) => ({
          id: item.id,
          category: item.category,
          key: item.key,
        })),
      );
    } else {
      setSelectedItems([]);
    }
  }, [isOpen, documents, employee]);

  if (!isOpen) return null;

  // Selection Checkers
  const isSelected = (item) =>
    selectedItems.some((x) => x.id === item.id && x.category === item.category);

  const toggleItem = (item) => {
    if (isSelected(item)) {
      setSelectedItems((prev) =>
        prev.filter((x) => !(x.id === item.id && x.category === item.category)),
      );
    } else {
      setSelectedItems((prev) => [
        ...prev,
        { id: item.id, category: item.category, key: item.key },
      ]);
    }
  };

  const isCategoryAllSelected = (categoryName) => {
    const categoryItems = allDownloadable.filter(
      (x) => x.category === categoryName,
    );
    if (categoryItems.length === 0) return false;
    return categoryItems.every((item) => isSelected(item));
  };

  const toggleCategory = (categoryName) => {
    const categoryItems = allDownloadable.filter(
      (x) => x.category === categoryName,
    );
    const categoryItemKeys = categoryItems.map((item) => ({
      id: item.id,
      category: item.category,
      key: item.key,
    }));

    if (isCategoryAllSelected(categoryName)) {
      // Deselect all in category
      setSelectedItems((prev) =>
        prev.filter(
          (x) =>
            !categoryItems.some(
              (item) => item.id === x.id && item.category === x.category,
            ),
        ),
      );
    } else {
      // Select all in category (avoid duplicates)
      setSelectedItems((prev) => {
        const filtered = prev.filter(
          (x) =>
            !categoryItems.some(
              (item) => item.id === x.id && item.category === x.category,
            ),
        );
        return [...filtered, ...categoryItemKeys];
      });
    }
  };

  const isAllSelected = () => {
    if (allDownloadable.length === 0) return false;
    return allDownloadable.every((item) => isSelected(item));
  };

  const toggleAll = () => {
    if (isAllSelected()) {
      setSelectedItems([]);
    } else {
      setSelectedItems(
        allDownloadable.map((item) => ({
          id: item.id,
          category: item.category,
          key: item.key,
        })),
      );
    }
  };

  // Download Trigger
  const handleDownloadSelected = async () => {
    if (selectedItems.length === 0) {
      await showAlert(
        "Please select at least one document or form to download.",
        { type: "warning" },
      );
      return;
    }

    setDownloading(true);
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // Important for handling binary data (ZIP)
      };

      const response = await axios.post(
        `/api/employees/${employee.id}/download-documents`,
        { selectedFiles: selectedItems },
        config,
      );

      // Create download link
      const blob = new Blob([response.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const rawName =
        `${employee.firstName || ""}_${employee.lastName || ""}`.trim() ||
        employee.employeeId;
      const downloadName = `${rawName.toLowerCase().replace(/\s+/g, "_")}_documents.zip`;

      link.setAttribute("download", downloadName);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onClose();
      await showAlert("ZIP archive downloaded successfully!", {
        type: "success",
      });
    } catch (err) {
      console.error("ZIP Download error:", err);
      await showAlert("Failed to generate and download documents ZIP file.", {
        type: "error",
      });
    } finally {
      setDownloading(false);
    }
  };

  const renderStatusBadge = (status) => {
    let bg = "bg-gray-100 text-gray-800 border-gray-200";
    if (status === "VERIFIED" || status === "APPROVED") {
      bg = "bg-green-50 text-green-700 border-green-200";
    } else if (status === "SUBMITTED" || status === "UPLOADED") {
      bg = "bg-blue-50 text-blue-700 border-blue-200";
    } else if (status === "DRAFT") {
      bg = "bg-amber-50 text-amber-700 border-amber-200";
    } else if (status === "REJECTED") {
      bg = "bg-red-50 text-red-700 border-red-200";
    }
    return (
      <span
        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${bg}`}
      >
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        {/* Loader Overlay */}
        {downloading && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="mb-4 text-blue-400"
            >
              <Loader2 size={48} />
            </motion.div>
            <h3 className="text-lg font-bold mb-1 tracking-wide">
              Generating Document Archive
            </h3>
            <p className="text-xs text-gray-400 max-w-xs text-center leading-relaxed">
              Please wait. Generating dynamic PDFs, packing candidate
              signatures, and bundling into a structured ZIP file...
            </p>
          </div>
        )}

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Download size={22} />
              </span>
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  Download Candidate Documents & Forms
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select files to export in a structured zip archive for{" "}
                  <strong className="text-gray-700">
                    {employee.firstName} {employee.lastName} (
                    {employee.employeeId})
                  </strong>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={downloading}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Checklist Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {allDownloadable.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <Info size={36} className="mb-2 text-gray-300" />
                <p className="text-sm font-semibold">
                  No Documents or Forms Available
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  The candidate has not uploaded any documents or submitted any
                  forms yet.
                </p>
              </div>
            ) : (
              <>
                {/* Select All Row */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <button
                    onClick={toggleAll}
                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    {isAllSelected() ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                    <span>
                      Select All Available ({allDownloadable.length} files)
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Category: Documents */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-blue-50/60 px-3 py-2 rounded-xl">
                      <button
                        onClick={() => toggleCategory("documents")}
                        className="flex items-center gap-2 text-xs font-bold text-blue-900 cursor-pointer hover:opacity-80"
                        disabled={availableDocs.length === 0}
                      >
                        {isCategoryAllSelected("documents") ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                        <span>DOCUMENTS ({availableDocs.length})</span>
                      </button>
                    </div>
                    <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                      {availableDocs.length === 0 ? (
                        <p className="text-xs text-gray-400 italic p-2">
                          None uploaded yet.
                        </p>
                      ) : (
                        availableDocs.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => toggleItem(item)}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                              isSelected(item)
                                ? "bg-blue-50/40 border-blue-200"
                                : "bg-white border-gray-100 hover:bg-gray-50/50"
                            }`}
                          >
                            <div className="mt-0.5 text-gray-500">
                              {isSelected(item) ? (
                                <CheckSquare className="w-4.5 h-4.5 text-blue-600" />
                              ) : (
                                <Square className="w-4.5 h-4.5 text-gray-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-800 truncate">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-gray-400 truncate mt-0.5 font-mono">
                                {item.fileName}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                {renderStatusBadge(item.status)}
                                <span className="text-[9px] text-gray-400">
                                  {formatDate(item.uploadedAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Category: Pre-Joining Forms */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-green-50/60 px-3 py-2 rounded-xl">
                      <button
                        onClick={() => toggleCategory("preJoiningForms")}
                        className="flex items-center gap-2 text-xs font-bold text-green-900 cursor-pointer hover:opacity-80"
                        disabled={availablePreForms.length === 0}
                      >
                        {isCategoryAllSelected("preJoiningForms") ? (
                          <CheckSquare className="w-4 h-4 text-green-700" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                        <span>
                          PRE-JOINING FORMS ({availablePreForms.length})
                        </span>
                      </button>
                    </div>
                    <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                      {availablePreForms.length === 0 ? (
                        <p className="text-xs text-gray-400 italic p-2">
                          None submitted yet.
                        </p>
                      ) : (
                        availablePreForms.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => toggleItem(item)}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                              isSelected(item)
                                ? "bg-green-50/20 border-green-200"
                                : "bg-white border-gray-100 hover:bg-gray-50/50"
                            }`}
                          >
                            <div className="mt-0.5 text-gray-500">
                              {isSelected(item) ? (
                                <CheckSquare className="w-4.5 h-4.5 text-green-600" />
                              ) : (
                                <Square className="w-4.5 h-4.5 text-gray-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-800">
                                {item.name}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                {renderStatusBadge(item.status)}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Category: Post-Joining Forms */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-purple-50/60 px-3 py-2 rounded-xl">
                      <button
                        onClick={() => toggleCategory("postJoiningForms")}
                        className="flex items-center gap-2 text-xs font-bold text-purple-900 cursor-pointer hover:opacity-80"
                        disabled={availablePostForms.length === 0}
                      >
                        {isCategoryAllSelected("postJoiningForms") ? (
                          <CheckSquare className="w-4 h-4 text-purple-700" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                        <span>
                          POST-JOINING FORMS ({availablePostForms.length})
                        </span>
                      </button>
                    </div>
                    <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                      {availablePostForms.length === 0 ? (
                        <p className="text-xs text-gray-400 italic p-2">
                          None submitted yet.
                        </p>
                      ) : (
                        availablePostForms.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => toggleItem(item)}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                              isSelected(item)
                                ? "bg-purple-50/20 border-purple-200"
                                : "bg-white border-gray-100 hover:bg-gray-50/50"
                            }`}
                          >
                            <div className="mt-0.5 text-gray-500">
                              {isSelected(item) ? (
                                <CheckSquare className="w-4.5 h-4.5 text-purple-600" />
                              ) : (
                                <Square className="w-4.5 h-4.5 text-gray-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-800">
                                {item.name}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                {renderStatusBadge(item.status)}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold">
              <span>
                {selectedItems.length} of {allDownloadable.length} files
                selected
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={downloading}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDownloadSelected}
                disabled={downloading || selectedItems.length === 0}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Selected</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DownloadSelectionModal;
