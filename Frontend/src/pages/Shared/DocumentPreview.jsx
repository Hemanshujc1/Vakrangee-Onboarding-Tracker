import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import PreviewActions from "../../Components/Forms/Shared/PreviewActions";
import { useAlert } from "../../context/AlertContext";
import { FileText, User } from "lucide-react";
import { CiZoomIn, CiZoomOut } from "react-icons/ci";


const DocumentPreview = () => {
  const { id: employeeId, docId } = useParams();
  const navigate = useNavigate();
  const { showAlert, showConfirm, showPrompt } = useAlert();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isHR = ["HR_ADMIN", "HR_SUPER_ADMIN"].includes(user.role);

  useEffect(() => {
    fetchData();
  }, [docId, employeeId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [docRes, empRes] = await Promise.all([
        axios.get(`/api/documents/list/${employeeId}`, config),
        axios.get(`/api/employees/${employeeId}`, config)
      ]);

      const doc = docRes.data.find(d => d.id === parseInt(docId));
      setDocument(doc);
      setEmployee(empRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      showAlert("Failed to load document.", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (status, reason = null) => {
    const isConfirmed = await showConfirm(
      `Are you sure you want to ${status === "VERIFIED" ? "approve" : "reject"} this document?`,
      { type: status === "VERIFIED" ? "info" : "warning" }
    );
    if (!isConfirmed) return;

    if (status === "REJECTED" && !reason) {
      reason = await showPrompt(
        "Please provide a reason for rejection (min 10 characters):",
        {
          title: "Rejection Reason",
          type: "warning",
          placeholder: "Enter reason...",
          confirmText: "Submit Rejection",
          cancelText: "Cancel",
        }
      );
      if (!reason) return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/documents/verify/${docId}`,
        { status, rejectionReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await showAlert(`Document ${status === "VERIFIED" ? "verified" : "rejected"} successfully.`, { type: "success" });
      navigate(-1);
    } catch (error) {
      console.error("Error verifying document:", error);
      showAlert("Failed to update status.", { type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-10 text-center text-gray-500">Loading document...</div>
      </DashboardLayout>
    );
  }

  if (!document) {
    return (
      <DashboardLayout>
        <div className="p-10 text-center text-gray-500">Document not found.</div>
      </DashboardLayout>
    );
  }

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(document.file_path);
  const isPDF = /\.pdf$/i.test(document.file_path);
  const folder =
    document.document_type === "Passport Size Photo"
      ? "profilepic"
      : document.document_type === "Signature"
      ? "signatures"
      : "documents";
  const fileUrl = `/uploads/${folder}/${document.file_path}`;

  const handleDownload = () => {
    const ext = document.file_path.split(".").pop();
    const empName = `${employee?.firstName || ""}_${employee?.lastName || ""}`.trim().toLowerCase().replace(/\s+/g, "_");
    const docName = (document.document_type || "document").toLowerCase().replace(/\s+/g, "_");
    const fileName = `${empName}_${docName}.${ext}`;

    const link = window.document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <PreviewActions
          status={document.status === "UPLOADED" ? "SUBMITTED" : document.status}
          isHR={isHR}
          onBack={() => navigate(-1)}
          onVerify={handleVerification}
          onPrint={handleDownload}
          printLabel="Download"
          isSubmitting={actionLoading}
          isSubmitHidden={true}
        />

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{document.document_type}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <User size={14} /> {employee?.firstName} {employee?.lastName}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    document.status === "VERIFIED" ? "bg-green-100 text-green-700" :
                    document.status === "REJECTED" ? "bg-red-100 text-red-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {document.status}
                  </span>
                </div>
              </div>
            </div>
           
          </div>

          <div className="relative p-8 bg-gray-50 flex justify-center items-start overflow-auto min-h-[600px] max-h-[80vh]">
            {isImage ? (
              <div className="flex flex-col items-center w-full">
                <div className="sticky top-0 z-10 flex gap-2 mb-4 p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg">
                  <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.25))} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium text-sm transition-colors"><CiZoomOut size={16}/></button>
                  <button onClick={() => setZoomLevel(1)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium text-sm transition-colors">Reset</button>
                  <button onClick={() => setZoomLevel(z => Math.min(4, z + 0.25))} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium text-sm transition-colors"><CiZoomIn size={16}/></button>
                </div>
                <img 
                  src={fileUrl} 
                  alt={document.document_type} 
                  style={{ 
                    transform: `scale(${zoomLevel})`, 
                    transformOrigin: "top center", 
                    transition: "transform 0.2s ease-out",
                    imageRendering: zoomLevel > 1 ? "high-quality" : "auto"
                  }} 
                  className="max-w-full h-auto shadow-2xl rounded-lg origin-top" 
                />
              </div>
            ) : isPDF ? (
              <iframe id="pdf-preview-iframe" src={fileUrl} className="w-full h-[600px] border-none rounded-lg shadow-2xl bg-white" title="PDF Preview" />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 gap-4 mt-20">
                <FileText size={64} />
                <p>Preview not available for this file type.</p>
                <a href={fileUrl} className="text-blue-400 hover:underline">Download to view</a>
              </div>
            )}
          </div>
          
          {document.status === "REJECTED" && document.rejection_reason && (
            <div className="p-6 bg-red-50 border-t border-red-100">
              <h4 className="text-sm font-bold text-red-800 mb-2">Rejection Reason:</h4>
              <p className="text-sm text-red-600">{document.rejection_reason}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DocumentPreview;
