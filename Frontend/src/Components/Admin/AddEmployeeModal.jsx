import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, UserPlus, Mail } from "lucide-react";
import axios from "axios";
import { useAlert } from "../../context/AlertContext";

const AddEmployeeModal = ({ isOpen, onClose, onAdd }) => {
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    cc: "",
    phone: null,
    role: "EMPLOYEE",
    jobTitle: "",
    department: "",
    location: "",
    startDate: "",
    managerId: "",
    onboarding_stage: "BASIC_INFO",
    password: "user@123",
  });

  const [managers, setManagers] = useState([]);
  const [sendingEmail, setSendingEmail] = useState(false);

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
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let hrName = "";
    let hrDesignation = "";
    if (formData.managerId) {
      // Use userId for comparison as the value is now userId
      const selectedManager = managers.find(
        (m) => m.userId === parseInt(formData.managerId),
      );
      if (selectedManager) {
        hrName = `${selectedManager.firstName} ${selectedManager.lastName}`;
        hrDesignation = selectedManager.role;
      }
    }

    onAdd({
      ...formData,
      hrName,
      hrDesignation,
      onboarding_hr_id: formData.managerId, // This will now be the User ID
    });

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      cc: "",
      phone: null,
      role: "EMPLOYEE",
      jobTitle: "",
      department: "",
      location: "",
      startDate: "",
      managerId: "",
      onboarding_stage: "BASIC_INFO",
      password: "user@123",
    });
  };

  const handleSendEmail = async () => {
    if (!formData.email || !formData.firstName || !formData.password) {
      await showAlert(
        "Please fill in First Name, Email and Password before sending Letter of Selection email.",
        { type: "warning" },
      );
      return;
    }

    setSendingEmail(true);
    try {
      const userInfo = localStorage.getItem("userInfo");
      const token = userInfo
        ? JSON.parse(userInfo).token
        : localStorage.getItem("token");
      if (!token) {
        await showAlert("Authentication token missing. Please login again.", {
          type: "error",
        });
        setSendingEmail(false);
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };

      let hrName = "";
      let hrDesignation = "";
      if (formData.managerId) {
        // Use userId for comparison
        const selectedManager = managers.find(
          (m) => m.userId === parseInt(formData.managerId),
        );
        if (selectedManager) {
          hrName = `${selectedManager.firstName} ${selectedManager.lastName}`;
          hrDesignation = selectedManager.jobTitle;
        }
      }

      await axios.post(
        "/api/email/send-welcome",
        {
          email: formData.email,
          firstName: formData.firstName,
          password: formData.password,
          jobTitle: formData.jobTitle,
          startDate: formData.startDate,
          location: formData.location || "Mumbai",
          hrName: hrName,
          hrDesignation: hrDesignation,
          cc: formData.cc,
        },
        config,
      );

      await showAlert("Letter of Selection email sent successfully!", {
        type: "success",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      await showAlert(
        error.response?.data?.message ||
          "Failed to send Letter of Selection email.",
        { type: "error" },
      );
    } finally {
      setSendingEmail(false);
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
          className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  required
                  placeholder="Rohit"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  required
                  placeholder="Sharma"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  required
                  placeholder="rohit@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CC (Optional)
                </label>
                <input
                  type="text"
                  name="cc"
                  value={formData.cc}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  placeholder="hr@example.com, manager@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  required
                  placeholder="Engineering"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  required
                  placeholder="Software Engineer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  style={{ colorScheme: "light" }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  placeholder="Mumbai"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HR Name
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
                  <option key={manager.id} value={manager.userId}>
                    {manager.firstName} {manager.lastName} ({manager.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                {sendingEmail ? "Sending..." : "Send Email"}
              </button>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  <Plus className="w-4 h-4" />
                  Add Employee
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors text-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddEmployeeModal;
