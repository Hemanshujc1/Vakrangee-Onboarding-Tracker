import React, { useState } from "react";
import { UserPlus, Download } from "lucide-react";
import AddEmployeeModal from "../../Components/Admin/AddEmployeeModal";
import { useNavigate } from "react-router-dom";
import { getEmployeeStatus } from "../../utils/employeeUtils";
import ExportModal from "../../Components/Shared/ExportModal";
import useEmployeeList from "../../hooks/useEmployeeList";
import axios from "axios";
import { useAlert } from "../../context/AlertContext";
import EmployeeManagementPage from "../../Components/Shared/EmployeeManagementPage";

const ManageEmployees = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const employeeListProps = useEmployeeList({
    filterPredicate: (emp) => emp.role === "EMPLOYEE",
    itemsPerPage: 5,
  });

  const { fetchEmployees, employees, options } = employeeListProps;

  const handleAddEmployee = async (formData) => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      const token = userInfo
        ? JSON.parse(userInfo).token
        : localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        username: formData.email,
        password: formData.password || "user@123",
        role: formData.role || "EMPLOYEE",
        firstName: formData.firstName,
        lastName: formData.lastName,
        department: formData.department,
        jobTitle: formData.jobTitle,
        location: formData.location,
        phone: formData.phone,
        startDate: formData.startDate,
        onboarding_hr_id: formData.onboarding_hr_id,
      };

      await axios.post("/api/auth/register", payload, config);
      await showAlert("Employee added successfully!", { type: "success" });

      setIsModalOpen(false);
      fetchEmployees(); // Refresh employee list after adding
    } catch (error) {
      console.error("Error adding employee:", error);
      await showAlert(
        error.response?.data?.message || "Failed to add employee.",
        { type: "error" }
      );
    }
  };

  return (
    <>
      <EmployeeManagementPage
        title="Manage Employees"
        subtitle="View and manage all employees in the system."
        actionLabel="Add New Employee"
        onAction={() => setIsModalOpen(true)}
        ActionIcon={UserPlus}
        headerChildren={
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-all font-medium cursor-pointer shadow-sm"
          >
            <Download size={20} />
            <span>Export</span>
          </button>
        }
        onRowClick={(emp) => navigate(`/hr-super-admin/employees/${emp.id}`)}
        onActivate={employeeListProps.handleActivate}
        onDelete={employeeListProps.handleDelete}
        {...employeeListProps}
      />

      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddEmployee}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={employees.map((emp) => ({
          ...emp,
          status: getEmployeeStatus(emp),
        }))}
        fileName="Employees_List"
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
          assignedHRName: "HR Assigned",
        }}
        options={options}
      />
    </>
  );
};

export default ManageEmployees;
