import { useState, useEffect } from "react";
import axios from "axios";
import * as Yup from "yup";
import { commonSchemas } from "../utils/validations";
import { useAlert } from "../context/AlertContext";

const DROPDOWN_BASE_URL = import.meta.env.VITE_DROPDOWN_BASE_URL;

// Validation Schema
const validationSchema = Yup.object().shape({
  firstname: commonSchemas.nameString.label("First Name"),
  lastname: commonSchemas.nameString.label("Last Name"),
  department_name: commonSchemas.stringRequired.label("Department"),
  job_title: commonSchemas.stringRequired.label("Job Title"),
  work_location: Yup.object()
    .shape({
      state: Yup.string().required("State is Required"),
      district: Yup.string().required("District is Required"),
      city: Yup.string().required("City is Required"),
    })
    .required("Work Location is Required")
    .nullable(),
  phone: commonSchemas.mobile,
  personal_email_id: commonSchemas.emailOptional,
  date_of_birth: commonSchemas.datePastOptional.max(
    new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
    "Must be 18 years or older",
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
  email: commonSchemas.emailOptional,
});

export const useEditProfileForm = () => {
  const { showAlert } = useAlert();
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

      const pi = record?.personal_info || {};
      const ci = record?.contact_info || {};
      const ji = record?.job_info || {};
      const addrs = record?.address_info || [];
      const permAddr = addrs.find((a) => a.address_type === "Permanent") || {};

      setFormData({
        firstname: pi.firstname || "",
        lastname: pi.lastname || "",
        department_name: ji.department_name || "",
        department_id: ji.department_id || "",
        job_title: ji.job_title || "",
        designation_id: ji.designation_id || "",
        work_location:
          typeof record?.work_location === "object" &&
          record?.work_location !== null
            ? record.work_location
            : { state: "", district: "", city: record?.work_location || "" },
        phone: ci.phone || "",
        address_line1: permAddr.address_line1 || "",
        address_line2: permAddr.address_line2 || "",
        landmark: permAddr.landmark || "",
        post_office: permAddr.post_office || "",
        pincode: permAddr.pincode || "",
        city: permAddr.city || "",
        district: permAddr.district || "",
        state: permAddr.state || "",
        country: permAddr.country || "India",
        date_of_birth: pi.date_of_birth || "",
        personal_email_id: ci.personal_email_id || "",
        gender: pi.gender || "",
      });

      if (!pi.firstname || !pi.lastname) {
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
        responses.map((r) => r.json()),
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
    setFormData((prev) => ({
      ...prev,
      department_id: id,
      department_name: name,
    }));
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
        const addressFields = [
          "address_line1",
          "address_line2",
          "landmark",
          "post_office",
          "pincode",
          "city",
          "district",
          "state",
          "country",
        ];
        if (addressFields.includes(key)) {
          formPayload.append(`perm_${key}`, formData[key] || "");
        }

        if (key === "work_location" && typeof formData[key] === "object") {
          formPayload.append(key, JSON.stringify(formData[key]));
        } else {
          formPayload.append(key, formData[key] || "");
        }
      });

      // Since EditProfileForm only has one address section, assume communication is same
      formPayload.append("comm_same_as_permanent", "true");

      if (imageFile) {
        formPayload.append("profile_photo", imageFile);
      }

      await axios.put("/api/profile", formPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      showAlert("Profile updated successfully!", { type: "success" });
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const newErrors = {};
        const invalidFields = [];
        const fieldLabels = {
          firstname: "First Name",
          lastname: "Last Name",
          department_name: "Department",
          job_title: "Job Title",
          work_location: "Work Location",
          "work_location.state": "Work Location State",
          "work_location.district": "Work Location District",
          "work_location.city": "Work Location City",
          phone: "Phone",
          personal_email_id: "Personal Email",
          date_of_birth: "Date of Birth",
          gender: "Gender",
          address_line1: "Address Line 1",
          address_line2: "Address Line 2",
          landmark: "Landmark",
          post_office: "Post Office",
          pincode: "Pincode",
          city: "City",
          district: "District",
          state: "State",
          country: "Country",
        };

        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
          const label = fieldLabels[err.path] || err.path;
          if (!invalidFields.includes(label)) {
            invalidFields.push(label);
          }
        });
        setErrors(newErrors);

        const alertText = `Please fill the required fields and correct the fields.\n\nMissing/Invalid fields:\n ${invalidFields.join("\n, ")}`;
        showAlert(alertText, { type: "error" });
      } else {
        console.error("Error updating profile:", error);
        const errorMsg =
          error.response?.data?.message ||
          "Failed to update profile. Please try again.";
        showAlert(errorMsg, { type: "error" });
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
