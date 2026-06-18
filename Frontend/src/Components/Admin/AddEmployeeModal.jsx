import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, UserPlus } from "lucide-react";
import axios from "axios";
import { useAlert } from "../../context/AlertContext";
import SearchableSelect from "../UI/SearchableSelect";
import Input from "../UI/Input";
import WorkLocationPicker from "../UI/WorkLocationPicker";
import { commonSchemas } from "../../utils/validations";
import { bandLevelData, uniqueBands } from "../../utils/bandLevelData";
import { useFormValidation } from "../../hooks/useFormValidation";
import { useDropdowns } from "../../hooks/useDropdowns";

const AddEmployeeModal = ({ isOpen, onClose, onAdd }) => {
  const todayObj = new Date();
  const today = todayObj.toISOString().split("T")[0];
  const maxDateObj = new Date();
  maxDateObj.setDate(todayObj.getDate() + 15);
  const maxDate = maxDateObj.toISOString().split("T")[0];
  const { showAlert } = useAlert();
  const { departments, designations, loadingDropdowns } = useDropdowns(isOpen);

  const {
    formData,
    setFormData,
    fieldErrors,
    handleChange,
    validateField,
    validateAll,
    resetForm,
  } = useFormValidation(
    {
      employee_id: "",
      firstName: "",
      lastName: "",
      email: "",
      cc: "",
      phone: null,
      role: "EMPLOYEE",
      jobTitle: "",
      department: "",
      band_id: "",
      band_name: "",
      band_level_id: "",
      level_name: "",
      startDate: "",
      managerId: "",
      onboarding_stage: "BASIC_INFO",
      password: "User@123",
    },
    {
      firstName: commonSchemas.nameString,
      lastName: commonSchemas.nameString,
      email: commonSchemas.email,
    }
  );

  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [workLocation, setWorkLocation] = useState({
    state: "",
    district: "",
    city: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchManagers();
    }
  }, [isOpen]);

  const fetchManagers = async () => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      const token = userInfo
        ? JSON.parse(userInfo).token
        : localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      // Fetch logged in user to auto-select
      const userStr = localStorage.getItem("user");
      const loggedInUser = userStr
        ? JSON.parse(userStr)
        : userInfo
          ? JSON.parse(userInfo)
          : null;
      const loggedInEmployeeId =
        loggedInUser?.employeeId || loggedInUser?.userId || loggedInUser?.id;

      const config = { headers: { Authorization: `Bearer ${token}` } };

      const { data } = await axios.get("/api/employees", config);

      const adminRoles = ["HR_ADMIN", "HR_SUPER_ADMIN"];
      const filteredManagers = data.filter(
        (emp) =>
          adminRoles.includes(emp.role) &&
          emp.accountStatus?.toUpperCase() === "ACTIVE",
      );

      const sortedManagers = filteredManagers.sort((a, b) =>
        a.firstName.localeCompare(b.firstName),
      );
      setManagers(sortedManagers);

      // Auto-select logged-in HR if they are in the managers list
      if (loggedInEmployeeId) {
        const isUserInManagers = sortedManagers.some(
          (m) => String(m.employeeId) === String(loggedInEmployeeId),
        );
        if (isUserInManagers) {
          setFormData((prev) => ({
            ...prev,
            managerId: String(loggedInEmployeeId),
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields before submitting
    const isValid = await validateAll(["firstName", "lastName", "email"]);
    if (!isValid) return;

    if (!formData.employee_id || !formData.startDate || !formData.firstName || !formData.lastName || !formData.email || !formData.band_id || !formData.band_level_id || !formData.department || !formData.jobTitle || !formData.managerId || !workLocation.state || !workLocation.district || !workLocation.city) {
      await showAlert("Please fill all mandatory fields.", { type: "error" });
      return;
    }

    setLoading(true);

    try {
      const userInfo = localStorage.getItem("userInfo");
      const token = userInfo
        ? JSON.parse(userInfo).token
        : localStorage.getItem("token");
      if (!token) {
        await showAlert("Authentication token missing. Please login again.", {
          type: "error",
        });
        setLoading(false);
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };

      let hrName = "";
      let hrDesignation = "";
      if (formData.managerId) {
        const selectedManager = managers.find(
          (m) => m.employeeId === formData.managerId,
        );
        if (selectedManager) {
          hrName = `${selectedManager.firstName} ${selectedManager.lastName}`;
          hrDesignation = selectedManager.jobTitle || selectedManager.role;
        }
      }

      // 1a. Map Department and Designation strings back out from the IDs
      const selectedDept = departments.find(
        (d) => String(d.department_id) === String(formData.department),
      );
      const selectedDesig = designations.find(
        (d) => String(d.designation_id) === String(formData.jobTitle),
      );

      const departmentName = selectedDept
        ? selectedDept.department_name
        : formData.department;
      const designationName = selectedDesig
        ? selectedDesig.designation_name
        : formData.jobTitle;

      // 1b. Add Employee
      await onAdd({
        ...formData,
        department_name: departmentName,
        department_id: parseInt(formData.department) || null,
        job_title: designationName,
        designation_id: parseInt(formData.jobTitle) || null,
        hrName,
        hrDesignation,
        onboarding_hr_id: formData.managerId,
        work_location: workLocation,
      });

      // 2. Send Welcome Email (only after successful registration)
      try {
        await axios.post(
          "/api/email/send-welcome",
          {
            email: formData.email,
            firstName: formData.firstName,
            password: formData.password,
            jobTitle: designationName,
            startDate: formData.startDate,
            location: workLocation.city || "Not Set",
            hrName: hrName,
            hrDesignation: hrDesignation,
            cc: formData.cc,
          },
          config,
        );
      } catch (emailErr) {
        console.error("Welcome email failed to send:", emailErr);
      }

      resetForm({
        employee_id: "",
        firstName: "",
        lastName: "",
        email: "",
        cc: "",
        phone: null,
        role: "EMPLOYEE",
        jobTitle: "",
        department: "",
        band_id: "",
        band_name: "",
        band_level_id: "",
        level_name: "",
        startDate: "",
        managerId: "",
        onboarding_stage: "BASIC_INFO",
        password: "User@123",
      });
      setWorkLocation({ state: "", district: "", city: "" });
    } catch (error) {
      console.error("Error adding employee:", error);
      await showAlert(
        error.response?.data?.message ||
          "Failed to process employee addition and email.",
        { type: "error" },
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" /> Add New Employee
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={<>Employee ID <span className="text-red-500">*</span></>}
                type="text"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                placeholder="EMP1001"
                required
              />
              <Input
                label={<>Joining Date <span className="text-red-500">*</span></>}
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min={today}
                max={maxDate}
                style={{ colorScheme: "light" }}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={<>First Name <span className="text-red-500">*</span></>}
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={(e) => validateField("firstName", e.target.value)}
                placeholder="Rohit"
                error={fieldErrors.firstName}
                required
              />
              <Input
                label={<>Last Name <span className="text-red-500">*</span></>}
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={(e) => validateField("lastName", e.target.value)}
                placeholder="Sharma"
                error={fieldErrors.lastName}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={<>Personal Email <span className="text-red-500">*</span></>}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={(e) => validateField("email", e.target.value)}
                placeholder="rohit@gmail.com"
                error={fieldErrors.email}
                required
              />
              <Input
                label="CC (Optional)"
                type="text"
                name="cc"
                value={formData.cc}
                onChange={handleChange}
                placeholder="hr@example.com, manager@example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Band <span className="text-red-500">*</span>
                </label>
                <select
                  name="band_id"
                  value={formData.band_id}
                  onChange={(e) => {
                    const selectedBandId = parseInt(e.target.value);
                    const selectedBand = uniqueBands.find(
                      (b) => b.id === selectedBandId,
                    );
                    setFormData({
                      ...formData,
                      band_id: selectedBandId,
                      band_name: selectedBand ? selectedBand.name : "",
                      band_level_id: "",
                      level_name: "",
                    });
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all bg-white"
                  required
                >
                  <option value="">Select Band</option>
                  {uniqueBands.map((band) => (
                    <option key={band.id} value={band.id}>
                      {band.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="band_level_id"
                  value={formData.band_level_id}
                  onChange={(e) => {
                    const selectedLevelId = parseInt(e.target.value);
                    const selectedLevel = bandLevelData.find(
                      (l) => l.band_level_id === selectedLevelId,
                    );
                    setFormData({
                      ...formData,
                      band_level_id: selectedLevelId,
                      level_name: selectedLevel ? selectedLevel.level_name : "",
                    });
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all bg-white"
                  required
                  disabled={!formData.band_id}
                >
                  <option value="">Select Level</option>
                  {bandLevelData
                    .filter((item) => item.band_id === formData.band_id)
                    .map((level) => (
                      <option
                        key={level.band_level_id}
                        value={level.band_level_id}
                      >
                        {level.level_name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <SearchableSelect
              label="Department"
              name="department"
              options={departments.map((dept) => ({
                id: dept.department_id,
                name: dept.department_name,
              }))}
              value={formData.department}
              onChange={handleChange}
              placeholder="Select Department"
              required
              disabled={loadingDropdowns}
            />

            <SearchableSelect
              label="Job Title"
              name="jobTitle"
              options={designations.map((des) => ({
                id: des.designation_id,
                name: des.designation_name,
              }))}
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="Select Job Title"
              required
              disabled={loadingDropdowns}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HR Name <span className="text-red-500">*</span>
              </label>
              <select
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all bg-white"
                required
              >
                <option value="">Select HR</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.employeeId}>
                    {manager.firstName} {manager.lastName} ({manager.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Hierarchical Location */}
            <WorkLocationPicker location={workLocation} setLocation={setWorkLocation} />

            <div className="flex justify-center items-center gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {loading ? "Processing..." : "Add Employee & Send Email"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddEmployeeModal;
