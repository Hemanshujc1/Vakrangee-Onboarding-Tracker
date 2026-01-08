import React from 'react';
import DashboardLayout from '../../Components/Layout/DashboardLayout';
import { Upload, File, Trash2, Eye } from 'lucide-react';

const Documents = () => {
  const documents = [
    { id: 1, name: 'Aadhar Card', status: 'Uploaded', fileName: 'aadhar_card.pdf', date: '2023-10-25' },
    { id: 2, name: 'PAN Card', status: 'Pending', fileName: null, date: null },
    { id: 3, name: 'Passport Photo', status: 'Saved', fileName: 'photo.jpg', date: '2023-10-26' },
    { id: 4, name: '10th Marksheet', status: 'Pending', fileName: null, date: null },
    { id: 5, name: '12th Marksheet', status: 'Pending', fileName: null, date: null },
  ];

  return (
    <DashboardLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-(--color-text-dark)">My Documents</h1>
        <p className="text-gray-500 mt-2">Upload and manage your personal documents.</p>
      </header>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-gray-100">
            {documents.map((doc) => (
                <div key={doc.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${doc.status === 'Uploaded' || doc.status === 'Saved' ? 'bg-blue-50 text-(--color-primary)' : 'bg-gray-100 text-gray-400'}`}>
                            <File size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-(--color-text-dark)">{doc.name}</h3>
                            {doc.fileName ? (
                                <p className="text-sm text-gray-500">
                                    {doc.fileName} • <span className="text-xs">Uploaded on {doc.date}</span>
                                </p>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No document uploaded</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {doc.status !== 'Pending' ? (
                            <>
                                <button className="p-2 text-gray-500 hover:text-(--color-primary) hover:bg-blue-50 rounded-lg transition-colors" title="View">
                                    <Eye size={20} />
                                </button>
                                <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                    <Trash2 size={20} />
                                </button>
                            </>
                        ) : (
                            <button className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-(--color-primary) hover:text-(--color-primary) hover:bg-blue-50 transition-all">
                                <Upload size={18} />
                                <span>Upload File</span>
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documents;
