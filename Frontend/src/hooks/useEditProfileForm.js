import { useState, useEffect } from "react";
import axios from "axios";
import * as Yup from "yup";
import { commonSchemas } from "../utils/validations";

const DROPDOWN_BASE_URL = import.meta.env.VITE_DROPDOWN_BASE_URL;

// Validation Schema
const validationSchema = Yup.object().shape({
  firstname: commonSchemas.nameString.label("First Name"),
  lastname: commonSchemas.nameString.label("Last Name"),
  department_name: commonSchemas.stringRequired.label("Department"),
  job_title: commonSchemas.stringRequired.label("Job Title"),
  work_location: commonSchemas.stringRequired.label("Work Location"),
  phone: commonSchemas.mobile,
  personal_email_id: commonSchemas.emailOptional,
  date_of_birth: commonSchemas.datePastOptional.max(
    new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
    "Must be 18 years or older"
  ),
  gender: Yup.string().optional(),
  address_line1: commonSchemas.addressString.label("Address Line 1"),
  address_line2: commonSchemas.addressStringOptional.label("Address Line 2"),
  landmark: commonSchemas.landmark,
  post_office: Yup.string().label("Post Office"),
  pincode: commonSchemas.pincode,
  city: commonSchemas.stringRequired.label("City"),
  district: commonSchemas.stringRequired.label("District"),
  state: commonSchemas.stringRequired.label("State"),
  country: commonSchemas.country,
});

export const useEditProfileForm = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [role, setRole] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    department_name: "",
    department_id: "",
    job_title: "",
    designation_id: "",
    work_location: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    landmark: "",
    post_office: "",
    pincode: "",
    city: "",
    district: "",
    state: "",
    country: "India",
    date_of_birth: "",
    personal_email_id: "",
    gender: "",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [initialRecord, setInitialRecord] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { role, email, record } = response.data;
      setRole(role);
      setCompanyEmail(email);
      setInitialRecord(record);

      setFormData({
        firstname: record.firstname || "",
        lastname: record.lastname || "",
        department_name: record.department_name || "",
        department_id: record.department_id || "",
        job_title: record.job_title || "",
        designation_id: record.designation_id || "",
        work_location: record.work_location || "",
        phone: record.phone || "",
        address_line1: record.address_line1 || "",
        address_line2: record.address_line2 || "",
        landmark: record.landmark || "",
        post_office: record.post_office || "",
        pincode: record.pincode || "",
        city: record.city || "",
        district: record.district || "",
        state: record.state || "",
        country: record.country || "India",
        date_of_birth: record.date_of_birth || "",
        personal_email_id: record.personal_email_id || "",
        gender: record.gender || "",
      });

      if (!record.firstname || !record.lastname) {
        setIsEditing(true);
      }

      if (record.profile_photo) {
        setPreviewImage(`/uploads/profilepic/${record.profile_photo}`);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage({ type: "error", text: "Failed to load profile data." });
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const responses = await Promise.all([
        fetch(`${DROPDOWN_BASE_URL}/department-list`),
        fetch(`${DROPDOWN_BASE_URL}/designation-list`),
      ]);
      const [deptRes, desRes] = await Promise.all(
        responses.map((r) => r.json())
      );
      if (deptRes?.status) setDepartments(deptRes.data);
      if (desRes?.status) setDesignations(desRes.data);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchDropdownData();
  }, []);

  const validateField = async (name, value) => {
    try {
      await validationSchema.validateAt(name, { ...formData, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: null }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [name]: err.message }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) validateField(name, value);
  };

  const handleDeptChange = (e) => {
    const id = e.target.value;
    const name = e.target.option?.name || "";
    setFormData((prev) => ({ ...prev, department_id: id, department_name: name }));
    if (errors.department_name) validateField("department_name", name);
  };

  const handleJobTitleChange = (e) => {
    const id = e.target.value;
    const name = e.target.option?.name || "";
    setFormData((prev) => ({ ...prev, designation_id: id, job_title: name }));
    if (errors.job_title) validateField("job_title", name);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    setErrors({});

    try {
      await validationSchema.validate(formData, { abortEarly: false });

      const token = localStorage.getItem("token");
      const formPayload = new FormData();

      Object.keys(formData).forEach((key) => {
        formPayload.append(key, formData[key]);
      });

      if (imageFile) {
        formPayload.append("profile_photo", imageFile);
      }

      await axios.put("/api/profile", formPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
        setMessage({ type: "error", text: "Please fix the errors." });
      } else {
        console.error("Error updating profile:", error);
        setMessage({
          type: "error",
          text: "Failed to update profile. Please try again.",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    message,
    role,
    companyEmail,
    errors,
    formData,
    previewImage,
    isEditing,
    setIsEditing,
    departments,
    designations,
    loadingDropdowns,
    initialRecord,
    handleInputChange,
    handleDeptChange,
    handleJobTitleChange,
    handleImageChange,
    handleSubmit,
    validateField,
    setErrors,
    fetchProfile,
  };
};
