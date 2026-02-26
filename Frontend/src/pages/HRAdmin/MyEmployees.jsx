import React, { useState } from "react";
import { Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getEmployeeStatus } from "../../utils/employeeUtils";
import ExportModal from "../../Components/Shared/ExportModal";
import useEmployeeList from "../../hooks/useEmployeeList";
import EmployeeManagementPage from "../../Components/Shared/EmployeeManagementPage";

const MyEmployees = () => {
  const navigate = useNavigate();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const employeeListProps = useEmployeeList({
    filterPredicate: (emp, user) => {
      return emp.role === "EMPLOYEE" && emp.onboardingHrId == user.id;
    },
    itemsPerPage: 5,
  });

  const { employees, options } = employeeListProps;

  return (
    <>
      <EmployeeManagementPage
        title="My Employees"
        subtitle={
          <>Track and manage onboarding for employees assigned to you.</>
        }
        headerChildren={
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-all font-medium cursor-pointer shadow-sm"
          >
            <Download size={20} />
            <span>Export</span>
          </button>
        }
        onRowClick={(emp) => navigate(`/hr-admin/employees/${emp.id}`)}
        onDelete={employeeListProps.handleDelete}
        onActivate={employeeListProps.handleActivate}
        emptyMessage="No employees found assigned to your ID."
        {...employeeListProps}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={employees.map((emp) => ({
          ...emp,
          status: getEmployeeStatus(emp),
        }))}
        fileName="My_Assigned_Employees"
        formatOptions={{
          firstName: "First Name",
          lastName: "Last Name",
          email: "Email",
          phone: "Phone",
          department: "Department",
          jobTitle: "Job Title",
          location: "Location",
          dateOfJoining: "Joining Date",
          status: "Status",
          role: "Role",
        }}
        options={options}
      />
    </>
  );
};

export default MyEmployees;
