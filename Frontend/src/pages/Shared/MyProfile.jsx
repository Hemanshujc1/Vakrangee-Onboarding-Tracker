import React from 'react';
import DashboardLayout from '../../Components/Layout/DashboardLayout';
import EditProfileForm from '../../Components/Profile/EditProfileForm';
import PageHeader from '../../Components/Shared/PageHeader';

const MyProfile = () => {
  return (
    <DashboardLayout>
      <PageHeader title="My Profile" />

      <div className="max-w-5xl mx-auto">
        <EditProfileForm />
      </div>
    </DashboardLayout>
  );
};

export default MyProfile;
