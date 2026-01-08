import React from 'react';
import DashboardLayout from '../../Components/Layout/DashboardLayout';
import { Lock } from 'lucide-react';

const PostJoiningForms = () => {
  return (
    <DashboardLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-(--color-text-dark)">Post-Joining Forms</h1>
        <p className="text-gray-500 mt-2">Formalities to be completed on your day of joining.</p>
      </header>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-6">
                <Lock size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Access Locked</h2>
            <p className="text-gray-500 max-w-md mx-auto">
                These digital forms (e.g., PF Nomination, Gratuity) will be unlocked by your HR Admin once you have successfully joined.
            </p>
      </div>
    </DashboardLayout>
  );
};

export default PostJoiningForms;
