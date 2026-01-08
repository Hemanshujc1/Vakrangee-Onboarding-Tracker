/*{ Required fields: 
firstName, lastName,
Company Email (which is used as the username for the portal), Password (bydefault set to admin@123), 
Role (HR_ADMIN by default), job_title, department_name (HR by default but can be change),work_location,

On clicking on the Add amdin button the admin will be added to the database and an email will be sent to the added admin with his login credentials (company email and password) and portal link. 
}*/

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, UserPlus, Mail } from "lucide-react";
import axios from "axios";
import Input from "../UI/Input";

const AddAdminModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    cc: "",
    phone: null,   // Default to null
    role: "HR_ADMIN",
    department: "HR",
    jobTitle: "",
    location: "",
    startDate: null, // Default to null
    password: "admin@123",
  });

  const [sendingEmail, setSendingEmail] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      cc: "",
      phone: "",
      role: "HR_ADMIN",
      department: "HR",
      jobTitle: "",
      location: "",
      startDate: null,
      password: "admin@123",
    });
  };

  const handleSendEmail = async () => {
    if (!formData.email || !formData.firstName) {
      alert("Please fill in First Name and Email before sending Admin welcome email.");
      return;
    }

    setSendingEmail(true);
    try {
      const userInfo = localStorage.getItem("userInfo");
      const token = userInfo ? JSON.parse(userInfo).token : null;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const hrName = "System Admin";
      const hrDesignation = "Administration";

      await axios.post("/api/email/send-admin-welcome", {
        email: formData.email,
        firstName: formData.firstName,
        password: formData.password,
        cc: formData.cc,
        portalUrl: window.location.origin // Dynamic portal URL
      }, config);

      alert("Admin welcome email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      alert(error.response?.data?.message || "Failed to send Admin Welocome email.");
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
            <div className="grid grid-cols-2 gap-4">
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
                  placeholder="Admin"
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
                  placeholder="User"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  required
                  placeholder="admin@vakrangee.in"
                />
              </div>
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
                  placeholder="HR"
                />
              </div>
            </div>

             <div className="grid grid-cols-2 gap-4">
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
                  placeholder="hr@vakrangee.in"
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
                  placeholder="HR Manager"
                />
              </div>
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


            <div className="flex justify-between items-center pt-4">
              <button
                 type="button"
                 onClick={handleSendEmail}
                 disabled={sendingEmail}
                 className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                  <Mail className="w-4 h-4" />
                  {sendingEmail ? "Sending..." : "Send Email"}
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200"
                >
                  <Plus className="w-4 h-4" />
                  Add Admin
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddAdminModal;
