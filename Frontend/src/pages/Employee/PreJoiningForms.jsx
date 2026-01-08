import React from 'react';
import DashboardLayout from '../../Components/Layout/DashboardLayout';
import { FileText, Edit, CheckCircle, ChevronRight } from 'lucide-react';

const PreJoiningForms = () => {
  const forms = [
      { id: 1, name: 'Employee Information Form', description: 'Detailed educational and family background.', status: 'Pending', time: '15 mins' },
      { id: 2, name: 'Employment Application Form', description: 'Immediate family members and dependents.', status: 'Pending', time: '5 mins' },
      { id: 3, name: 'Form-F-Gratuity Nomination', description: 'Non-Disclosure Agreement acceptance.', status: 'Completed', time: '5 mins' },
      { id: 4, name: 'Mediclaim Form', description: 'Company policies acknowledgement.', status: 'Pending', time: '10 mins' },
  ];

  return (
    <DashboardLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-(--color-text-dark)">Pre-Joining Forms</h1>
        <p className="text-gray-500 mt-2">Please fill out the following forms digitally.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {forms.map((form) => (
            <div key={form.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all group">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-lg ${form.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-(--color-primary)'}`}>
                        <FileText size={24} />
                    </div>
                    {form.status === 'Completed' ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                            <CheckCircle size={12} /> Completed
                        </span>
                    ) : (
                         <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            ~ {form.time}
                        </span>
                    )}
                </div>
                
                <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-(--color-primary) transition-colors">{form.name}</h3>
                <p className="text-sm text-gray-500 mb-6 min-h-10">{form.description}</p>

                <button className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                    form.status === 'Completed' 
                    ? 'bg-gray-50 text-gray-600 hover:bg-gray-100' 
                    : 'bg-(--color-primary) text-white hover:brightness-110 shadow-sm'
                }`}>
                    {form.status === 'Completed' ? (
                        <>View Submitted</>
                    ) : (
                        <>
                            Start Filling <ChevronRight size={16} />
                        </>
                    )}
                </button>
            </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default PreJoiningForms;
