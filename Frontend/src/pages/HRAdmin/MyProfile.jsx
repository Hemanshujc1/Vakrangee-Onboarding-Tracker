import React from 'react';
import DashboardLayout from '../../Components/Layout/DashboardLayout';
import EditProfileForm from '../../Components/Profile/EditProfileForm';

const MyProfile = () => {
  return (
    <DashboardLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-(--color-text-dark)">My Profile</h1>
      </header>
    
      <div className="max-w-5xl mx-auto">
        <EditProfileForm />
      </div>
    </DashboardLayout>
  );
};

export default MyProfile;
