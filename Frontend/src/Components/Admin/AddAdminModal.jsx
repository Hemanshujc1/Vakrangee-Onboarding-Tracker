import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, UserPlus } from "lucide-react";
import axios from "axios";
import { useAlert } from "../../context/AlertContext";
import SearchableSelect from "../UI/SearchableSelect";
import Input from "../UI/Input";
import WorkLocationPicker from "../UI/WorkLocationPicker";
import { commonSchemas } from "../../utils/validations";
import { useFormValidation } from "../../hooks/useFormValidation";
import { useDropdowns } from "../../hooks/useDropdowns";

const AddAdminModal = ({ isOpen, onClose, onAdd }) => {
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
      role: "HR_ADMIN",
      department: "Human Resource",
      jobTitle: "",
      location: "",
      password: "Admin@123",
    },
    {
      firstName: commonSchemas.nameString,
      lastName: commonSchemas.nameString,
      email: commonSchemas.email,
    }
  );

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields before submitting
    const isValid = await validateAll(["firstName", "lastName", "email"]);
    if (!isValid) return;

    if (!formData.employee_id || !formData.firstName || !formData.lastName || !formData.email || !formData.department || !formData.jobTitle || !workLocation.state || !workLocation.district || !workLocation.city) {
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

      // 1b. Add Admin
      await onAdd({
        ...formData,
        department_name: departmentName,
        department_id: parseInt(formData.department) || null,
        job_title: designationName,
        designation_id: parseInt(formData.jobTitle) || null,
        location: workLocation.city || "Not Set",
        work_location: workLocation,
      });

      // 2. Send Admin Welcome Email (only after successful registration)
      try {
        await axios.post(
          "/api/email/send-admin-welcome",
          {
            email: formData.email,
            firstName: formData.firstName,
            password: formData.password,
            cc: formData.cc,
            portalUrl: `${window.location.origin}${import.meta.env.BASE_URL}`,
            hrName: hrDetails.name,
            hrDesignation: hrDetails.designation,
          },
          config,
        );
      } catch (emailErr) {
        console.error("Admin welcome email failed to send:", emailErr);
      }

      resetForm({
        employee_id: "",
        firstName: "",
        lastName: "",
        email: "",
        cc: "",
        role: "HR_ADMIN",
        department:
          departments
            .find((d) => d.department_name.toLowerCase() === "human resource")
            ?.department_id.toString() || "Human Resource",
        jobTitle: "",
        location: "",
        password: "Admin@123",
      });
      setWorkLocation({ state: "", district: "", city: "" });
    } catch (error) {
      console.error("Error adding admin:", error);
      await showAlert(
        error.response?.data?.message ||
          "Failed to process admin addition and email.",
        { type: "error" },
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCurrentUserDetails();
    }
  }, [isOpen]);

  // Adjust default department ID if needed after departments load
  useEffect(() => {
    if (formData.department === "Human Resource" && departments.length > 0) {
      const hrDept = departments.find(
        (d) =>
          d.department_name &&
          d.department_name.toLowerCase() === "human resource",
      );
      if (hrDept) {
        setFormData((prev) => ({
          ...prev,
          department: String(hrDept.department_id),
        }));
      }
    }
  }, [departments, formData.department, setFormData]);

  const [hrDetails, setHrDetails] = useState({ name: "", designation: "" });

  const [workLocation, setWorkLocation] = useState({
    state: "",
    district: "",
    city: "",
  });

  const fetchCurrentUserDetails = async () => {
    try {
      let token = null;
      let user = null;

      const userInfo = localStorage.getItem("userInfo");
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        token = parsed.token;
        user = parsed.user;
      } else if (storedUser && storedToken) {
        token = storedToken;
        user = JSON.parse(storedUser);
      }

      if (!token || !user || !user.employeeId) {
        console.error("Missing user info or employeeId", { user });
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(
        `/api/employees/${user.employeeId}`,
        config,
      );

      if (data) {
        setHrDetails({
          name: `${data.firstName} ${data.lastName}`,
          designation: data.jobTitle || data.role || "HR Admin",
        });
      }
    } catch (error) {
      console.error("Error fetching current user details:", error);
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
              <UserPlus className="w-5 h-5 text-blue-600" /> Add New Admin
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <Input
                label={<>Employee ID <span className="text-red-500">*</span></>}
                type="text"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                placeholder="EMP2001"
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
                placeholder="Rahul"
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
                placeholder="Verma"
                error={fieldErrors.lastName}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={<>Email Address <span className="text-red-500">*</span></>}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={(e) => validateField("email", e.target.value)}
                placeholder="rahul.v@company.com"
                error={fieldErrors.email}
                required
              />
              <Input
                label="CC Email (Optional)"
                type="text"
                name="cc"
                value={formData.cc}
                onChange={handleChange}
                placeholder="manager@company.com"
              />
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

            {/* Hierarchical Location */}
            <WorkLocationPicker location={workLocation} setLocation={setWorkLocation} />

            {/* Removed phone block per user request */}

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
                {loading ? "Processing..." : "Add HR & Send Email"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddAdminModal;
