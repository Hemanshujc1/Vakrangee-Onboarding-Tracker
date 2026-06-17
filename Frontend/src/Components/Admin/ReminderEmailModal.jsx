import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Bell,
  CheckSquare,
  Square,
  Info,
  Loader2,
  Send,
} from "lucide-react";
import axios from "axios";
import { useAlert } from "../../context/AlertContext";
import { DOCUMENT_CONFIG } from "../../config/documentConfig";

// ── Onboarding stage ordering ──────────────────────────────────────────────
const STAGE_ORDER = [
  "BASIC_INFO",
  "PRE_JOINING",
  "PRE_JOINING_VERIFIED",
  "POST_JOINING",
  "COMPLETED",
];

const stageIndex = (stage) => STAGE_ORDER.indexOf(stage ?? "BASIC_INFO");

// ── Form definitions ────────────────────────────────────────────────────────
const PRE_JOINING_FORMS_LIST = [
  {
    key: "EMPLOYMENT_APP",
    label: "Application Form",
    statusKey: "applicationStatus",
  },

  { key: "MEDICLAIM", label: "Mediclaim Form", statusKey: "mediclaimStatus" },
  {
    key: "EMPLOYEE_INFO",
    label: "Employee Information Form",
    statusKey: "employeeInfoStatus",
  },
  {
    key: "GRATUITY",
    label: "Gratuity Form (Form F)",
    statusKey: "gratuityStatus",
  },
];

const POST_JOINING_FORMS_LIST = [
  {
    key: "NDA",
    label: "Non-Disclosure Agreement (NDA)",
    statusKey: "ndaStatus",
  },
  {
    key: "DECLARATION",
    label: "Declaration Form",
    statusKey: "declarationStatus",
  },

  { key: "TDS", label: "TDS Declaration Form", statusKey: "tdsStatus" },
  { key: "EPF", label: "EPF Form", statusKey: "epfStatus" },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
const isDocComplete = (status) =>
  !!status &&
  ["UPLOADED", "VERIFIED", "SUBMITTED"].includes((status || "").toUpperCase());

const isFormComplete = (status) => !!status && status !== "PENDING";

const renderStatusBadge = (status) => {
  const s = (status || "PENDING").toUpperCase();
  let bg = "bg-gray-100 text-gray-800 border-gray-200";
  if (s === "VERIFIED" || s === "APPROVED")
    bg = "bg-green-50 text-green-700 border-green-200";
  else if (s === "SUBMITTED" || s === "UPLOADED")
    bg = "bg-blue-50 text-blue-700 border-blue-200";
  else if (s === "DRAFT") bg = "bg-amber-50 text-amber-700 border-amber-200";
  else if (s === "REJECTED") bg = "bg-red-50 text-red-700 border-red-200";
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${bg}`}
    >
      {s}
    </span>
  );
};

// ── Main Component ──────────────────────────────────────────────────────────
const ReminderEmailModal = ({ isOpen, onClose, employee, documents }) => {
  const { showAlert } = useAlert();
  const [sending, setSending] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]); // { type: "doc"|"preForm"|"postForm", key }

  const stage = employee?.onboardingStage ?? "BASIC_INFO";
  const idx = stageIndex(stage);
  const showPreForms = idx >= stageIndex("PRE_JOINING");
  const showPostForms = idx >= stageIndex("POST_JOINING");

  // ── Build item lists ──────────────────────────────────────────────────────

  // All docs from config — every doc is shown, pending ones are selectable
  const docsMap = {};
  (documents || []).forEach((d) => {
    docsMap[d.document_type] = d;
  });

  const docItems = DOCUMENT_CONFIG.map((cfg) => {
    const doc = docsMap[cfg.key];
    const status = doc?.status || "PENDING";
    return {
      key: cfg.key,
      name: cfg.label,
      status,
      done: isDocComplete(status),
      type: "doc",
      optional: cfg.optional,
    };
  });

  const preFormItems = PRE_JOINING_FORMS_LIST.map((f) => {
    const status = employee?.[f.statusKey] || "PENDING";
    return {
      key: f.key,
      name: f.label,
      status,
      done: isFormComplete(status),
      type: "preForm",
    };
  });

  const postFormItems = POST_JOINING_FORMS_LIST.map((f) => {
    const status = employee?.[f.statusKey] || "PENDING";
    return {
      key: f.key,
      name: f.label,
      status,
      done: isFormComplete(status),
      type: "postForm",
    };
  });

  // Selectable = not done
  const selectableDocs = docItems.filter((i) => !i.done);
  const selectablePreForms = preFormItems.filter((i) => !i.done);
  const selectablePostForms = postFormItems.filter((i) => !i.done);

  const allSelectable = [
    ...selectableDocs,
    ...(showPreForms ? selectablePreForms : []),
    ...(showPostForms ? selectablePostForms : []),
  ];

  // Reset & pre-select all pending items when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedItems(
        allSelectable.map((i) => ({ type: i.type, key: i.key })),
      );
    } else {
      setSelectedItems([]);
    }
  }, [isOpen, documents, employee]);

  if (!isOpen) return null;

  // ── Selection helpers ─────────────────────────────────────────────────────
  const isSelected = (item) =>
    selectedItems.some((s) => s.type === item.type && s.key === item.key);

  const toggleItem = (item) => {
    if (item.done) return;
    if (isSelected(item)) {
      setSelectedItems((prev) =>
        prev.filter((s) => !(s.type === item.type && s.key === item.key)),
      );
    } else {
      setSelectedItems((prev) => [...prev, { type: item.type, key: item.key }]);
    }
  };

  const isCategoryAllSelected = (items) => {
    const sel = items.filter((i) => !i.done);
    return sel.length > 0 && sel.every((i) => isSelected(i));
  };

  const toggleCategory = (items) => {
    const sel = items.filter((i) => !i.done);
    if (isCategoryAllSelected(items)) {
      setSelectedItems((prev) =>
        prev.filter(
          (s) => !sel.some((i) => i.type === s.type && i.key === s.key),
        ),
      );
    } else {
      const toAdd = sel
        .filter((i) => !isSelected(i))
        .map((i) => ({ type: i.type, key: i.key }));
      setSelectedItems((prev) => [...prev, ...toAdd]);
    }
  };

  const isAllSelected = () =>
    allSelectable.length > 0 && allSelectable.every((i) => isSelected(i));

  const toggleAll = () => {
    if (isAllSelected()) {
      setSelectedItems([]);
    } else {
      setSelectedItems(
        allSelectable.map((i) => ({ type: i.type, key: i.key })),
      );
    }
  };

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (selectedItems.length === 0) {
      await showAlert(
        "Please select at least one item to remind the employee about.",
        { type: "warning" },
      );
      return;
    }
    setSending(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/employees/${employee.id}/send-reminder`,
        { items: selectedItems },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await showAlert("Reminder email sent successfully!", { type: "success" });
      onClose();
    } catch (error) {
      console.error("Error sending reminder:", error);
      await showAlert(
        error.response?.data?.message ||
          "Failed to send reminder email. Please try again.",
        { type: "error" },
      );
    } finally {
      setSending(false);
    }
  };

  // ── Render a single item card ─────────────────────────────────────────────
  const renderItemCard = (item, selectedColor, checkColor) => (
    <div
      key={item.key}
      onClick={() => !item.done && toggleItem(item)}
      className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all select-none
        ${
          item.done
            ? "bg-gray-50/60 border-gray-100 opacity-70 cursor-not-allowed"
            : isSelected(item)
              ? `${selectedColor} cursor-pointer`
              : "bg-white border-gray-100 hover:bg-gray-50/50 cursor-pointer"
        }`}
    >
      <div className="mt-0.5 text-gray-500 shrink-0">
        {item.done ? (
          <CheckSquare className={`w-4 h-4 ${checkColor} opacity-40`} />
        ) : isSelected(item) ? (
          <CheckSquare className={`w-4 h-4 ${checkColor}`} />
        ) : (
          <Square className="w-4 h-4 text-gray-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
        {item.optional !== undefined && (
          <p className="text-[9px] text-gray-400 mt-0.5">
            {item.optional ? "Optional" : "Mandatory"}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          {renderStatusBadge(item.status)}
          {item.done && (
            <span className="text-[9px] text-green-600 font-semibold">
              Done
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        {/* Sending Overlay */}
        {sending && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="mb-4 text-orange-400"
            >
              <Loader2 size={48} />
            </motion.div>
            <h3 className="text-lg font-bold mb-1 tracking-wide">
              Sending Reminder Email
            </h3>
            <p className="text-xs text-gray-400 max-w-xs text-center leading-relaxed">
              Please wait. Composing and sending the reminder email to the
              employee...
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
              <span className="p-2 bg-orange-50 text-orange-500 rounded-xl">
                <Bell size={22} />
              </span>
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  Send Reminder Email
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select pending items to remind{" "}
                  <strong className="text-gray-700">
                    {employee.firstName} {employee.lastName} (
                    {employee.employeeId})
                  </strong>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={sending}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Checklist Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {allSelectable.length === 0 && docItems.every((d) => d.done) ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <Info size={36} className="mb-2 text-gray-300" />
                <p className="text-sm font-semibold">Everything is Complete</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  The employee has uploaded all documents and completed all
                  required forms.
                </p>
              </div>
            ) : (
              <>
                {/* Select All Row */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <button
                    onClick={toggleAll}
                    className="flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors cursor-pointer"
                  >
                    {isAllSelected() ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                    <span>
                      Select All Pending ({allSelectable.length} items)
                    </span>
                  </button>
                </div>

                <div
                  className={`grid grid-cols-1 gap-6 ${showPreForms || showPostForms ? "md:grid-cols-3" : "md:grid-cols-1 max-w-sm"}`}
                >
                  {/* ── Documents ────────────────────────────────── */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-blue-50/60 px-3 py-2 rounded-xl">
                      <button
                        onClick={() => toggleCategory(docItems)}
                        className="flex items-center gap-2 text-xs font-bold text-blue-900 cursor-pointer hover:opacity-80"
                        disabled={selectableDocs.length === 0}
                      >
                        {isCategoryAllSelected(docItems) ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                        <span>DOCUMENTS ({docItems.length})</span>
                      </button>
                      <span className="text-[10px] text-blue-600 font-semibold">
                        {selectableDocs.length} pending
                      </span>
                    </div>
                    <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                      {docItems.map((item) =>
                        renderItemCard(
                          item,
                          "bg-blue-50/40 border-blue-200",
                          "text-blue-600",
                        ),
                      )}
                    </div>
                  </div>

                  {/* ── Pre-Joining Forms ─────────────────────────── */}
                  {showPreForms && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-green-50/60 px-3 py-2 rounded-xl">
                        <button
                          onClick={() => toggleCategory(preFormItems)}
                          className="flex items-center gap-2 text-xs font-bold text-green-900 cursor-pointer hover:opacity-80"
                          disabled={selectablePreForms.length === 0}
                        >
                          {isCategoryAllSelected(preFormItems) ? (
                            <CheckSquare className="w-4 h-4 text-green-700" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                          <span>PRE-JOINING FORMS ({preFormItems.length})</span>
                        </button>
                        <span className="text-[10px] text-green-600 font-semibold">
                          {selectablePreForms.length} pending
                        </span>
                      </div>
                      <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                        {selectablePreForms.length === 0 &&
                        preFormItems.every((f) => f.done) ? (
                          <p className="text-xs text-gray-400 italic p-2">
                            All forms completed.
                          </p>
                        ) : (
                          preFormItems.map((item) =>
                            renderItemCard(
                              item,
                              "bg-green-50/20 border-green-200",
                              "text-green-600",
                            ),
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Post-Joining Forms ────────────────────────── */}
                  {showPostForms && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-purple-50/60 px-3 py-2 rounded-xl">
                        <button
                          onClick={() => toggleCategory(postFormItems)}
                          className="flex items-center gap-2 text-xs font-bold text-purple-900 cursor-pointer hover:opacity-80"
                          disabled={selectablePostForms.length === 0}
                        >
                          {isCategoryAllSelected(postFormItems) ? (
                            <CheckSquare className="w-4 h-4 text-purple-700" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                          <span>
                            POST-JOINING FORMS ({postFormItems.length})
                          </span>
                        </button>
                        <span className="text-[10px] text-purple-600 font-semibold">
                          {selectablePostForms.length} pending
                        </span>
                      </div>
                      <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                        {selectablePostForms.length === 0 &&
                        postFormItems.every((f) => f.done) ? (
                          <p className="text-xs text-gray-400 italic p-2">
                            All forms completed.
                          </p>
                        ) : (
                          postFormItems.map((item) =>
                            renderItemCard(
                              item,
                              "bg-purple-50/20 border-purple-200",
                              "text-purple-600",
                            ),
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold">
              <span>
                {selectedItems.length} of {allSelectable.length} pending items
                selected
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || selectedItems.length === 0}
                className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-sm"
              >
                <Send className="w-4 h-4" />
                <span>Send Reminder</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReminderEmailModal;
