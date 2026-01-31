import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/HRSuperAdmin/Dashboard";
import ManageEmployees from "./pages/HRSuperAdmin/ManageEmployees";
import ManageAdmins from "./pages/HRSuperAdmin/ManageAdmins";
import AdminDetail from "./pages/HRSuperAdmin/AdminDetail";
import EmployeeDetail from "./pages/Shared/EmployeeDetail";
import MyProfile from "./pages/HRSuperAdmin/MyProfile";
import MyEmployees from "./pages/HRSuperAdmin/MyEmployees";
import Temp from "./pages/temp";
import ProtectedRoute from "./Components/Auth/ProtectedRoute";

// HR Admin Pages
import HRAdminDashboard from "./pages/HRAdmin/Dashboard";
import HRAdminEmployees from "./pages/HRAdmin/ManageEmployees";
import OtherEmployees from "./pages/HRAdmin/OtherEmployees";
import HRAdminProfile from "./pages/HRAdmin/MyProfile";

// Employee Pages
import EmployeeDashboard from "./pages/Employee/Dashboard";
import BasicInformation from "./pages/Employee/BasicInformation";
import Documents from "./pages/Employee/Documents";
import PreJoiningForms from "./pages/Employee/PreJoiningForms";
import PostJoiningForms from "./pages/Employee/PostJoiningForms";
import MyHR from "./pages/Employee/MyHR";
import FormInformation from "./pages/Forms/FormInformation";
import FormMediclaim from "./pages/Forms/FormMediclaim";
import FormNDA from "./pages/Forms/FormNDA";
import FormDeclaration from "./pages/Forms/FormDeclaration";
import PreviewMediclaim from "./pages/Forms/PreviewMediclaim";
import PreviewNDA from "./pages/Forms/PreviewNDA";
import PreviewDeclaration from "./pages/Forms/PreviewDeclaration";
import CompanyOverview from "./pages/Employee/CompanyOverview";
import FormGratuity from "./pages/Forms/FormGratuity";
import PreviewGratuity from "./pages/Forms/PreviewGratuity";
import CheckList from "./pages/Employee/CheckList";
import FormEPF from "./pages/Forms/FormEPF";
import FormTDS from "./pages/Forms/FormTDS";
import PreviewTDS from "./pages/Forms/PreviewTDS";
import FormApplication from "./pages/Forms/FormApplication";
import PreviewApplication from "./pages/Forms/PreviewApplication";
import PreviewEPF from "./pages/Forms/PreviewEPF";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import VerifyOTP from "./pages/Auth/VerifyOTP";
import ResetPassword from "./pages/Auth/ResetPassword";
import PreviewInformation from "./pages/Forms/PreviewInformation";
import { AlertProvider } from "./context/AlertContext";
import CustomAlert from "./components/UI/CustomAlert";


const App = () => {
  return (
    <AlertProvider>
      <CustomAlert />
      <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/temp" element={<Temp />} />

      {/* HR Super Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={["HR_SUPER_ADMIN"]} />}>
        <Route path="/hr-super-admin" element={<Dashboard />} />
        <Route path="/hr-super-admin/employees" element={<ManageEmployees />} />
        <Route path="/hr-super-admin/admins" element={<ManageAdmins />} />
        <Route path="/hr-super-admin/admins/:id" element={<AdminDetail />} />
        <Route
          path="/hr-super-admin/employees/:id"
          element={<EmployeeDetail />}
        />
        <Route path="/hr-super-admin/profile" element={<MyProfile />} />
        <Route path="/hr-super-admin/myemployees" element={<MyEmployees />} />
      </Route>

      {/* HR Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={["HR_ADMIN"]} />}>
        <Route path="/hr-admin" element={<HRAdminDashboard />} />
        <Route path="/hr-admin/other-employees" element={<OtherEmployees />} />
        <Route path="/hr-admin/employees" element={<HRAdminEmployees />} />
        <Route path="/hr-admin/employees/:id" element={<EmployeeDetail />} />
        <Route path="/hr-admin/profile" element={<HRAdminProfile />} />
      </Route>

      {/* Employee Routes */}
      <Route element={<ProtectedRoute allowedRoles={["EMPLOYEE"]} />}>
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/employee/basic-info" element={<BasicInformation />} />
        <Route path="/employee/documents" element={<Documents />} />
        <Route path="/employee/pre-joining" element={<PreJoiningForms />} />
        <Route path="/employee/post-joining" element={<PostJoiningForms />} />
        <Route path="/employee/myHr" element={<MyHR />} />
        <Route
          path="/employee/company-overview"
          element={<CompanyOverview />}
        />
        <Route path="/employee/check-list" element={<CheckList />} />

        {/* Forms accessible by Employee - Some might be shared but generally edited by employee */}
        <Route path="/forms/employment-info" element={<FormInformation />} />
        <Route path="/forms/mediclaim" element={<FormMediclaim />} />
        <Route path="/forms/non-disclosure-agreement" element={<FormNDA />} />
        <Route path="/forms/declaration-form" element={<FormDeclaration />} />
        <Route path="/forms/gratuity-form" element={<FormGratuity />} />
        <Route path="/forms/employees-provident-fund/:employeeId?" element={<FormEPF />} />
        <Route path="/forms/tds-form" element={<FormTDS />} />
        <Route
          path="/forms/employment-application"
          element={<FormApplication />}
        />
      </Route>

      {/* Shared/Universal Protected Routes - Viewable by involved parties */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE", "HR_ADMIN", "HR_SUPER_ADMIN"]}
          />
        }
      >
        <Route
          path="/forms/information/preview"
          element={<PreviewInformation />}
        />
        <Route
          path="/forms/information/preview/:id"
          element={<PreviewInformation />}
        />
        <Route path="/forms/mediclaim/preview" element={<PreviewMediclaim />} />
        <Route
          path="/forms/non-disclosure-agreement/preview"
          element={<PreviewNDA />}
        />
        <Route
          path="/forms/declaration-form/preview"
          element={<PreviewDeclaration />}
        />
        <Route
          path="/forms/gratuity-form/preview"
          element={<PreviewGratuity />}
        />
        <Route
          path="/forms/gratuity-form/preview"
          element={<PreviewGratuity />}
        />
        <Route path="/forms/tds-form/preview" element={<PreviewTDS />} />
        <Route
          path="/forms/application/preview"
          element={<PreviewApplication />}
        />
        <Route
          path="/forms/application/preview/:employeeId"
          element={<PreviewApplication />}
        />
        <Route
          path="/forms/employees-provident-fund/preview/:employeeId"
          element={<PreviewEPF />}
        />
      </Route>
    </Routes>
    </AlertProvider>
  );
};

export default App;
