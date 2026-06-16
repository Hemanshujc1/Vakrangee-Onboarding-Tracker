import React from "react";
import { FileSpreadsheet, FileText } from "lucide-react";

const ExportModalFormats = ({ exportFormat, setExportFormat }) => {
  return (
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
};

export default ExportModalFormats;
