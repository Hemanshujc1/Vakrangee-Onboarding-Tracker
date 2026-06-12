import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, UserPlus } from "lucide-react";
import axios from "axios";
import { useAlert } from "../../context/AlertContext";
import SearchableSelect from "../UI/SearchableSelect";
import { commonSchemas } from "../../utils/validationSchemas";

const AddAdminModal = ({ isOpen, onClose, onAdd }) => {
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({
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
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const schemaMap = {
    firstName: commonSchemas.nameString,
    lastName: commonSchemas.nameString,
    email: commonSchemas.email,
  };

  const validateField = async (name, value) => {
    const schema = schemaMap[name];
    if (!schema) return true;
    try {
      await schema.validate(value);
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
      return true;
    } catch (err) {
      setFieldErrors((prev) => ({ ...prev, [name]: err.message }));
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Re-validate live only if the field already has an error shown
    if (fieldErrors[name]) validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields before submitting
    const [fnOk, lnOk, emailOk] = await Promise.all([
      validateField("firstName", formData.firstName),
      validateField("lastName", formData.lastName),
      validateField("email", formData.email),
    ]);
    if (!fnOk || !lnOk || !emailOk) return;

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

      setFormData({
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
      setSelectedStateId("");
      setSelectedDistrictId("");
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

  const [hrDetails, setHrDetails] = useState({ name: "", designation: "" });
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // New location states
  const [workLocation, setWorkLocation] = useState({
    state: "",
    district: "",
    city: "",
  });
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [loadingRegions, setLoadingRegions] = useState(false);

  const DROPDOWN_BASE_URL = import.meta.env.VITE_DROPDOWN_BASE_URL;

  useEffect(() => {
    if (isOpen) {
      fetchCurrentUserDetails();
      fetchDropdownData();
    }
  }, [isOpen]);

  const fetchDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const responses = await Promise.all([
        fetch(`${DROPDOWN_BASE_URL}/department-list`),
        fetch(`${DROPDOWN_BASE_URL}/designation-list`),
        fetch(`${DROPDOWN_BASE_URL}/state-list`),
      ]);

      const [deptRes, desRes, stateRes] = await Promise.all(
        responses.map((r) => r.json()),
      );

      if (deptRes?.status) {
        setDepartments(deptRes.data);
        // Resolve default department ID if not already an ID
        if (formData.department === "Human Resource") {
          const hrDept = deptRes.data.find(
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
      }
      if (desRes?.status) {
        setDesignations(desRes.data);
      }
      if (stateRes?.status) {
        setStates(stateRes.data);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  // Fetch Districts when selectedStateId changes
  useEffect(() => {
    if (!selectedStateId) {
      setDistricts([]);
      return;
    }
    const fetchDistricts = async () => {
      setLoadingRegions(true);
      try {
        const response = await fetch(
          `${DROPDOWN_BASE_URL}/district-list/${selectedStateId}`,
        );
        const data = await response.json();
        if (data?.status) setDistricts(data.data);
      } catch (error) {
        console.error("Error fetching districts:", error);
      } finally {
        setLoadingRegions(false);
      }
    };
    fetchDistricts();
  }, [selectedStateId]);

  // Fetch Cities when selectedDistrictId changes
  useEffect(() => {
    if (!selectedStateId || !selectedDistrictId) {
      setCities([]);
      return;
    }
    const fetchCities = async () => {
      setLoadingRegions(true);
      try {
        const response = await fetch(
          `${DROPDOWN_BASE_URL}/city-list/${selectedStateId}/${selectedDistrictId}`,
        );
        const data = await response.json();
        if (data?.status) setCities(data.data);
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setLoadingRegions(false);
      }
    };
    fetchCities();
  }, [selectedDistrictId, selectedStateId]);

  const handleStateChange = (id, name) => {
    setSelectedStateId(id);
    setSelectedDistrictId("");
    setDistricts([]);
    setCities([]);
    setWorkLocation((prev) => ({
      ...prev,
      state: name,
      district: "",
      city: "",
    }));
  };

  const handleDistrictChange = (id, name) => {
    setSelectedDistrictId(id);
    setCities([]);
    setWorkLocation((prev) => ({ ...prev, district: name, city: "" }));
  };

  const handleCityChange = (name) => {
    setWorkLocation((prev) => ({ ...prev, city: name }));
  };

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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                placeholder="EMP2001"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={(e) => validateField("firstName", e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border focus:ring-2 outline-hidden transition-all ${
                    fieldErrors.firstName
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  placeholder="Rahul"
                  required
                />
                {fieldErrors.firstName && (
                  <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                    <span>⚠</span> {fieldErrors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={(e) => validateField("lastName", e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border focus:ring-2 outline-hidden transition-all ${
                    fieldErrors.lastName
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  placeholder="Verma"
                  required
                />
                {fieldErrors.lastName && (
                  <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                    <span>⚠</span> {fieldErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={(e) => validateField("email", e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border focus:ring-2 outline-hidden transition-all ${
                    fieldErrors.email
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  placeholder="rahul.v@company.com"
                  required
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                    <span>⚠</span> {fieldErrors.email}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CC Email (Optional)
                </label>
                <input
                  type="text"
                  name="cc"
                  value={formData.cc}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  placeholder="manager@company.com"
                />
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

            {/* Hierarchical Location */}
            <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-4">
              <h3 className="text-sm font-medium text-gray-700">
                Work Location <span className="text-red-500">*</span>
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <SearchableSelect
                  label="State"
                  name="state"
                  options={states.map((s) => ({
                    id: s.lg_state_id,
                    name: s.state_name,
                  }))}
                  value={workLocation.state}
                  onChange={(e) =>
                    handleStateChange(
                      e.target.value,
                      e.target.option?.name || "",
                    )
                  }
                  placeholder="State"
                  required
                />
                <SearchableSelect
                  label="District"
                  name="district"
                  options={districts.map((d) => ({
                    id: d.district_id,
                    name: d.district_name,
                  }))}
                  value={workLocation.district}
                  onChange={(e) =>
                    handleDistrictChange(
                      e.target.value,
                      e.target.option?.name || "",
                    )
                  }
                  placeholder="District"
                  disabled={!selectedStateId || loadingRegions}
                  required
                />
                <SearchableSelect
                  label="City"
                  name="city"
                  options={cities.map((c) => ({
                    id: c.lg_village_id,
                    name: c.village_name,
                  }))}
                  value={workLocation.city}
                  onChange={(e) =>
                    handleCityChange(e.target.option?.name || "")
                  }
                  placeholder="City"
                  disabled={!selectedDistrictId || loadingRegions}
                  required
                />
              </div>
            </div>

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
