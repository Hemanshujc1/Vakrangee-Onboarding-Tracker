import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../Components/Layout/DashboardLayout';
import { Upload, Eye, CheckCircle, AlertCircle, ShieldCheck, Trash2, Loader2 } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';
import axios from 'axios';
import { DOCUMENT_CONFIG } from '../../config/documentConfig';
import { formatDate } from '../../utils/basicInfoHelpers';


const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingState, setUploadingState] = useState({});
  const [deletingState, setDeletingState] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert, showConfirm } = useAlert();

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching docs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file, docType) => {
    if (!file) return;

    setUploadingState(prev => ({ ...prev, [docType]: true }));

    const formData = new FormData();
    formData.append('documentType', docType);
    formData.append('file', file);

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        fetchDocuments();
        await showAlert("Document uploaded successfully!", { type: 'success' });
      } else {
        await showAlert('Upload failed. Please try again.', { type: 'error' });
      }
    } catch (error) {
      console.error('Error uploading:', error);
      await showAlert('Server error during upload.', { type: 'error' });
    } finally {
      setUploadingState(prev => ({ ...prev, [docType]: false }));
    }
  };

  const handleDelete = async (docId, docType) => {
    const isConfirmed = await showConfirm(
      "Are you sure you want to delete this document?",
      { type: "warning" }
    );
    if (!isConfirmed) return;

    setDeletingState(prev => ({ ...prev, [docType]: true }));
    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchDocuments();
        await showAlert("Document deleted.", { type: "success" });
      } else {
        await showAlert("Failed to delete document.", { type: "error" });
      }
    } catch (error) {
      console.error('Delete error:', error);
      await showAlert("Server error while deleting.", { type: "error" });
    } finally {
      setDeletingState(prev => ({ ...prev, [docType]: false }));
    }
  };

  const handleSubmitNewDocuments = async () => {
    const isConfirmed = await showConfirm(
      "Are you sure you want to submit your newly uploaded documents for HR review?"
    );
    if (!isConfirmed) return;

    setIsSubmitting(true);
    try {
      await axios.post(
        "/api/employees/submit-documents",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await showAlert("Documents submitted for HR review.", { type: "success" });
      fetchDocuments();
    } catch (error) {
      console.error("Error submitting documents:", error);
      await showAlert(
        error.response?.data?.message || "Failed to submit documents.",
        { type: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDocStatus = (docKey) => {
    const doc = documents.find(d => d.document_type === docKey);
    return doc
      ? { status: doc.status?.toUpperCase() || 'UPLOADED', data: doc }
      : { status: 'PENDING', data: null };
  };

  const getFileViewUrl = (reqDoc, data) => {
    if (reqDoc.key === "Passport Size Photo") return `/uploads/profilepic/${data.file_path}`;
    if (reqDoc.key === "Signature") return `/uploads/signatures/${data.file_path}`;
    return `/uploads/documents/${data.file_path}`;
  };

  // A document can be edited (re-uploaded / deleted) when it's PENDING, UPLOADED, or REJECTED
  // SUBMITTED = awaiting HR review, VERIFIED = permanently locked
  const canEdit = (status) => !status || status === 'PENDING' || status === 'UPLOADED' || status === 'REJECTED';

  const hasUploadedDocs = documents.some(d => d.status?.toUpperCase() === 'UPLOADED');

  return (
    <DashboardLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-(--color-text-dark)">My Documents</h1>
        <p className="text-gray-500 mt-2">Upload and manage your onboarding documents here.</p>
        <div className="mt-4 flex gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Verified</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-400"></span> Submitted</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> Uploaded</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400"></span> Rejected</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-300"></span> Pending</div>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading documents...</div>
        ) : (
          <div className="grid grid-cols-1 divide-y divide-gray-100">
            {DOCUMENT_CONFIG.map((reqDoc) => {
              const { status, data } = getDocStatus(reqDoc.key);
              const isUploading = uploadingState[reqDoc.key];
              const isDeleting = deletingState[reqDoc.key];
              const editable = canEdit(status);

              // Status badge colour
              const statusBadge = {
                VERIFIED:  { bg: 'bg-green-100',  text: 'text-green-700'  },
                SUBMITTED: { bg: 'bg-blue-100',   text: 'text-blue-700'   },
                UPLOADED:  { bg: 'bg-yellow-100', text: 'text-yellow-700' },
                REJECTED:  { bg: 'bg-red-100',    text: 'text-red-700'    },
              }[status];

              return (
                <div
                  key={reqDoc.key}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Left: icon + info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`p-3 rounded-lg shrink-0 ${
                      status === 'VERIFIED' || status === 'UPLOADED' || status === 'SUBMITTED'
                        ? 'bg-green-50 text-green-600'
                        : status === 'REJECTED'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {status === 'REJECTED'
                        ? <AlertCircle size={24} />
                        : <CheckCircle size={24} />
                      }
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-(--color-text-dark) flex flex-wrap items-center gap-2">
                        {reqDoc.label}
                        {!reqDoc.optional
                          ? <span className="text-red-500 text-xs">*</span>
                          : null}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          reqDoc.optional ? 'bg-gray-100 text-gray-600' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {reqDoc.optional ? 'Optional' : 'Mandatory'}
                        </span>

                        {statusBadge && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${statusBadge.bg} ${statusBadge.text}`}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                            {data?.verifiedByName && <span>by {data.verifiedByName}</span>}
                          </span>
                        )}
                      </h3>

                      {data ? (
                        <div className="text-sm text-gray-500 mt-1">
                          <p className="truncate max-w-xs">{data.original_name}</p>
                          <p className="text-xs">Uploaded on {formatDate(data.uploaded_at)}</p>
                          {status === 'REJECTED' && data.rejection_reason && (
                            <p className="text-xs text-red-600 mt-1 font-medium">
                              Reason: {data.rejection_reason}
                            </p>
                          )}
                          {status === 'SUBMITTED' && (
                            <p className="text-xs text-blue-600 mt-1 font-medium italic">
                              Awaiting HR review — no changes allowed
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic mt-1">Pending upload</p>
                      )}
                    </div>
                  </div>

                  {/* Right: action buttons */}
                  <div className="flex items-center gap-2 shrink-0 justify-end">
                    {/* View */}
                    {data && (
                      <a
                        href={getFileViewUrl(reqDoc, data)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-(--color-primary) hover:bg-blue-50 rounded-lg transition-colors"
                        title="View document"
                      >
                        <Eye size={20} />
                      </a>
                    )}

                    {/* Upload / Re-upload — only when editable */}
                    {editable && (
                      <div className="relative">
                        <input
                          type="file"
                          id={`file-${reqDoc.key}`}
                          className="hidden"
                          accept={reqDoc.accept || ".pdf,.jpg,.jpeg,.png"}
                          onChange={(e) => handleUpload(e.target.files[0], reqDoc.key)}
                          disabled={isUploading}
                        />
                        <label
                          htmlFor={`file-${reqDoc.key}`}
                          className={`flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600
                            hover:border-(--color-primary) hover:text-(--color-primary) hover:bg-blue-50 transition-all cursor-pointer
                            ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                          title={data ? "Re-upload document" : "Upload document"}
                        >
                          <Upload size={16} />
                          <span>{isUploading ? 'Uploading…' : data ? 'Re-upload' : 'Upload'}</span>
                        </label>
                      </div>
                    )}

                    {/* Delete — only when editable and doc exists */}
                    {editable && data && (
                      <button
                        onClick={() => handleDelete(data.id, reqDoc.key)}
                        disabled={isDeleting}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete document"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit New Documents — only shown when there are UPLOADED (unsent) docs */}
      {hasUploadedDocs && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmitNewDocuments}
            disabled={isSubmitting}
            className={`flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl transition-all font-bold shadow-lg ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700 hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
            <span>{isSubmitting ? 'Submitting...' : 'Submit New Documents'}</span>
          </button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Documents;
