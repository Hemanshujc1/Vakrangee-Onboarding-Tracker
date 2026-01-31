import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../Components/Layout/DashboardLayout';
import { Upload, Trash2, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';

const REQUIRED_DOCUMENTS = [
    { name: '10th Marksheet', key: '10th Marksheet', optional: false },
    { name: '12th Marksheet', key: '12th Marksheet', optional: false },
    { name: 'Aadhar Card', key: 'Aadhar Card', optional: false },
    { name: 'PAN Card', key: 'PAN Card', optional: false },
    { name: 'Cancelled Cheque', key: 'Cancelled Cheque', optional: false },
    { name: 'Passport Size Photo', key: 'Passport Size Photo', optional: false },
    { name: 'Degree Certificate', key: 'Degree Certificate', optional: true },
    { name: 'Service Certificates', key: 'Service Certificates', optional: true },
    { name: 'Relieving Letter', key: 'Relieving Letter', optional: true },
    { name: 'Experience Certificate', key: 'Experience Certificate', optional: true },
    { name: 'Last Drawn Salary Slip', key: 'Last Drawn Salary Slip', optional: true },
];

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingState, setUploadingState] = useState({}); // { docKey: boolean }
  const { showAlert, showConfirm } = useAlert();

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
        const response = await fetch('http://localhost:3001/api/documents', {
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
        const response = await fetch('http://localhost:3001/api/documents/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });

        if (response.ok) {

            fetchDocuments();
            await showAlert("Document uploaded successfully!", { type: 'success' });
        } else {
            console.error('Upload failed');
            await showAlert('Upload failed. Please try again.', { type: 'error' });
        }
    } catch (error) {
        console.error('Error uploading:', error);
        await showAlert('Server error during upload.', { type: 'error' });
    } finally {
        setUploadingState(prev => ({ ...prev, [docType]: false }));
    }
  };

  const handleDelete = async (docId) => {
      const isConfirmed = await showConfirm("Are you sure you want to delete this document?", { type: 'warning' });
      if(!isConfirmed) return;

      try {
        const response = await fetch(`http://localhost:3001/api/documents/${docId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
            fetchDocuments();
            await showAlert("Document deleted successfully.", { type: 'success' });
        } else {
            await showAlert('Failed to delete.', { type: 'error' });
        }
      } catch (error) {
          console.error('Delete error:', error);
      }
  };

  const getDocStatus = (docKey) => {
      const doc = documents.find(d => d.document_type === docKey);
      return doc ? { status: doc.status || 'UPLOADED', data: doc } : { status: 'PENDING', data: null };
  };

  return (
    <DashboardLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-(--color-text-dark)">My Documents</h1>
        <p className="text-gray-500 mt-2">Please upload the required documents below.</p>
        <div className="mt-4 flex gap-4 text-sm">
             <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Uploaded</div>
             <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-300"></span> Pending</div>
        </div>
      </header>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
            <div className="p-8 text-center text-gray-500">Loading documents...</div>
        ) : (
            <div className="grid grid-cols-1 divide-y divide-gray-100">
                {REQUIRED_DOCUMENTS.map((reqDoc) => {
                    const { status, data } = getDocStatus(reqDoc.key);
                    const isUploading = uploadingState[reqDoc.key];

                    return (
                        <div key={reqDoc.key} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`p-3 rounded-lg ${status === 'UPLOADED' || status === 'VERIFIED' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {status === 'UPLOADED' || status === 'VERIFIED' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-(--color-text-dark) flex flex-wrap items-center gap-2">
                                        {reqDoc.name}
                                        {reqDoc.optional ? <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">Optional</span> : <span className="text-xs font-bold text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full">Mandatory</span> }
                                        {status === 'VERIFIED' && (
                                            <span className="px-3 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                                                Verified
                                                {data.verifiedByName && <span>by {data.verifiedByName}</span>}
                                            </span>
                                        )}
                                        {status === 'REJECTED' && (
                                           <span className="px-3 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium flex items-center gap-1">
                                                Rejected
                                                {data.verifiedByName && <span>by {data.verifiedByName}</span>}
                                            </span>
                                        )}
                                    </h3>
                                    {data ? (
                                        <div className="text-sm text-gray-500 mt-1">
                                            <p className="truncate max-w-xs">{data.original_name}</p>
                                            <p className="text-xs">Uploaded on {new Date(data.uploaded_at).toLocaleDateString()}</p>
                                            {status === 'REJECTED' && data.rejection_reason && (
                                                <p className="text-xs text-red-600 mt-1 font-medium">Reason: {data.rejection_reason}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic mt-1">Pending upload</p>
                                    )}
                                </div>
                            </div>
        
                            <div className="flex items-center gap-3 w-full md:w-auto justify-end md:justify-start">
                                {data ? (
                                    <>
                                        <a 
                                            href={`http://localhost:3001/uploads/documents/${data.file_path}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="p-2 text-gray-500 hover:text-(--color-primary) hover:bg-blue-50 rounded-lg transition-colors" 
                                            title="View"
                                        >
                                            <Eye size={20} />
                                        </a>
                                        {status !== 'VERIFIED' && (
                                            <button 
                                                onClick={() => handleDelete(data.id)}
                                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                                                title="Delete"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}

                                    </>
                                ) : (
                                    <div className="relative w-full md:w-auto">
                                        <input 
                                            type="file" 
                                            id={`file-${reqDoc.key}`}
                                            className="hidden" 
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => handleUpload(e.target.files[0], reqDoc.key)}
                                            disabled={isUploading}
                                        />
                                        <label 
                                            htmlFor={`file-${reqDoc.key}`}
                                            className={`flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-(--color-primary) hover:text-(--color-primary) hover:bg-blue-50 transition-all cursor-pointer w-full justify-center md:w-auto ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                                        >
                                            <Upload size={18} />
                                            <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Documents;
