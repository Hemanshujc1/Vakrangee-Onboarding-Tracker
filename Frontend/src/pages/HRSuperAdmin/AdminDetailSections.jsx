import React from "react";
import { ArrowLeft, Mail, Phone, MapPin, Building, Briefcase, Users, Pencil, Search, Filter, Download, Clock, CheckCircle, IdCard } from "lucide-react";
import SearchableSelect from "../../Components/UI/SearchableSelect";
import WorkLocationPicker from "../../Components/UI/WorkLocationPicker";
import EmployeeTable from "../../Components/Shared/EmployeeTable";
import { parseWorkLocation } from "../../utils/basicInfoHelpers";

// ---------------------------------------------------------------------------
// AdminProfileHeader — back button + page title + account status badge
// ---------------------------------------------------------------------------
export const AdminProfileHeader = ({ navigate, accountStatus }) => (
  <div>
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4"
    >
      <ArrowLeft size={20} />
      <span>Back to Admins</span>
    </button>
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold text-gray-800">Admin Profile</h1>
      <div
        className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
          accountStatus === "Inactive"
            ? "bg-red-50 text-red-600 border-red-500"
            : accountStatus === "INVITED"
              ? "bg-yellow-50 text-yellow-600 border-yellow-500"
              : "bg-green-50 text-green-600 border-green-500"
        }`}
      >
        {accountStatus || "ACTIVE"}
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// AdminStatsGrid — 4 stat tiles for the admin detail page
// ---------------------------------------------------------------------------
export const AdminStatsGrid = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {[
      { label: "Assigned Employees", value: stats?.totalAssigned || 0, icon: Users, color: "blue" },
      { label: "Onboarding Active", value: stats?.activeOnboarding || 0, icon: Clock, color: "yellow" },
      { label: "Fully Onboarded", value: stats?.completed || 0, icon: CheckCircle, color: "green" },
      { label: "Not Joined", value: stats?.notJoined || 0, icon: Users, color: "gray" },
    ].map(({ label, value, icon: Icon, color }) => (
      <div key={label} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-500 font-medium text-sm">{label}</h3>
          <div className={`p-2 bg-${color}-50 text-${color}-600 rounded-lg`}>
            <Icon size={20} />
          </div>
        </div>
        <p className="text-3xl font-bold text-[#4E4E4E]">{value}</p>
      </div>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// AdminProfileCard — editable profile info card
// ---------------------------------------------------------------------------
export const AdminProfileCard = ({
  admin,
  isEditing,
  setIsEditing,
  editForm,
  setEditForm,
  handleSave,
  departmentsList = [],
  designationsList = [],
  loadingDropdowns = false,
}) => {
  const handleDeptChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      department: e.target.option?.name || "",
      department_id: e.target.value,
    }));
  };

  const handleDesigChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      jobTitle: e.target.option?.name || "",
      designation_id: e.target.value,
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-32 bg-linear-to-r from-blue-600 to-blue-800"></div>
      <div className="px-4 md:px-8 pb-8">
        <div className="relative flex flex-col md:flex-row justify-between items-center md:items-end -mt-12 mb-6 gap-4">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 w-full md:w-auto">
            <div className="relative shrink-0">
              {admin.profilePhoto ? (
                <img
                  src={admin.profilePhoto}
                  alt={admin.firstName}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white flex items-center justify-center text-4xl font-bold text-blue-600">
                  {admin.firstName?.[0]}
                </div>
              )}
            </div>
            <div className="mb-2 text-center md:text-left mt-2 md:mt-0 w-full">
              <h2 className="text-2xl font-bold text-gray-800">
                {admin.firstName} {admin.lastName}
              </h2>
              <div className="text-blue-600 font-medium flex items-center justify-center md:justify-start gap-2">
                <Briefcase size={16} />
                {isEditing ? (
                  <div className="w-full max-w-xs">
                    <SearchableSelect
                      name="jobTitle"
                      options={designationsList.map((des) => ({
                        id: des.designation_id,
                        name: des.designation_name,
                      }))}
                      value={editForm.designation_id || editForm.jobTitle}
                      onChange={handleDesigChange}
                      placeholder="Select Job Title"
                      disabled={loadingDropdowns}
                    />
                  </div>
                ) : (
                  <span>{admin.jobTitle || admin.role}</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="mb-2 p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors self-center md:self-end"
            title="Edit Details"
          >
            <Pencil size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6] shrink-0">
              <Mail size={18} />
            </div>
            <div className="w-full">
              <p className="text-xs text-gray-400">Company Email</p>
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="border border-gray-300 rounded-xl px-4 py-2 text-sm w-full mt-1 focus:outline-none focus:border-[#2C9DE6]"
                />
              ) : (
                <p className="font-medium text-sm">{admin.email || "N/A"}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6] shrink-0">
              <Phone size={18} />
            </div>
            <div className="w-full">
              <p className="text-xs text-gray-400">Phone</p>
              <p className="font-medium text-sm">{admin.phone || "N/A"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
              <Building size={18} />
            </div>
            <div className="w-full">
              <p className="text-xs text-gray-400">Department</p>
              {isEditing ? (
                <SearchableSelect
                  name="department"
                  options={departmentsList.map((dept) => ({
                    id: dept.department_id,
                    name: dept.department_name,
                  }))}
                  value={editForm.department_id || editForm.department}
                  onChange={handleDeptChange}
                  placeholder="Select Department"
                  disabled={loadingDropdowns}
                />
              ) : (
                <p className="font-medium text-sm">{admin.department || "N/A"}</p>
              )}
            </div>
          </div>

          <div className={`flex items-start gap-3 text-gray-600 ${isEditing ? "col-span-1 md:col-span-3" : ""}`}>
            <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6] shrink-0">
              <MapPin size={18} />
            </div>
            <div className="w-full">
              <p className="text-xs text-gray-400">Location</p>
              {isEditing ? (
                <div className="mt-1">
                  <WorkLocationPicker
                    location={editForm.work_location || { state: "", district: "", city: "" }}
                    setLocation={(newLoc) => {
                      setEditForm({
                        ...editForm,
                        work_location: typeof newLoc === "function" ? newLoc(editForm.work_location || {}) : newLoc,
                      });
                    }}
                    layout="horizontal"
                  />
                </div>
              ) : (
                <p className="font-medium text-sm">{admin.location || "N/A"}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center gap-3 col-span-1 md:col-span-3 justify-end mt-4 border-t pt-4">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    email: admin.email || "",
                    location: admin.location || "",
                    work_location: parseWorkLocation(admin.work_location, admin.location),
                    jobTitle: admin.jobTitle || "",
                    designation_id: admin.designation_id || "",
                    department: admin.department || "",
                    department_id: admin.department_id || "",
                  });
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#2C9DE6] hover:bg-[#205081] text-white rounded-lg text-sm font-medium whitespace-nowrap"
              >
                Save Changes
              </button>
            </div>
          )}
          {!isEditing && (
            <div className="flex items-center gap-3 text-gray-600">
              <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6] shrink-0">
                <Users size={18} />
              </div>
              <div className="w-full">
                <p className="text-xs text-gray-400">Gender</p>
                <p className="font-medium text-sm">{admin.gender || "N/A"}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6] shrink-0">
              <IdCard size={18} />
            </div>
            <div className="w-full">
              <p className="text-xs text-gray-400">Employee ID</p>
              <p className="font-medium text-sm">{admin.employeeId || admin.employee_id || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// AdminAssignedEmployees — search + filter + export toolbar + employee table
// ---------------------------------------------------------------------------
export const AdminAssignedEmployees = ({
  searchTerm,
  setSearchTerm,
  setIsSidebarOpen,
  setIsExportModalOpen,
  filteredEmployees,
  assignedEmployeesLength,
  onRowClick,
  onActivate,
  onDelete,
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 mb-4">
      <h3 className="text-lg font-bold text-[#4E4E4E]">Assigned Employees</h3>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2C9DE6]"
          />
        </div>

        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-gray-600 hover:text-[#2C9DE6] bg-white border border-gray-200 hover:border-[#2C9DE6] rounded-lg transition-all"
          title="Filter"
        >
          <Filter size={18} />
        </button>
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="p-2 text-gray-600 hover:text-[#2C9DE6] bg-white border border-gray-200 hover:border-[#2C9DE6] rounded-lg transition-all"
          title="Export"
        >
          <Download size={18} />
        </button>
      </div>
    </div>

    <EmployeeTable
      employees={filteredEmployees}
      onRowClick={onRowClick}
      showAssignedDate={true}
      emptyMessage={
        assignedEmployeesLength === 0
          ? "No employees assigned to this admin yet."
          : "No employees match your search."
      }
      onActivate={onActivate}
      onDelete={onDelete}
    />
  </div>
);
