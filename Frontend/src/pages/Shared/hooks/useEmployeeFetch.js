import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export const useEmployeeFetch = (id) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hrAdmins, setHrAdmins] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [emailSent, setEmailSent] = useState(false);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [designationsList, setDesignationsList] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  const [editForm, setEditForm] = useState({
    department: "",
    department_id: "",
    jobTitle: "",
    designation_id: "",
    location: "",
    dateOfJoining: "",
    personalEmail: "",
    onboardingHrId: "",
    band_id: "",
    band_name: "",
    band_level_id: "",
    level_name: "",
  });

  const fetchDropdownData = useCallback(async () => {
    setLoadingDropdowns(true);
    try {
      const BASE_URL = "/vakrangee-onboarding-portal/vakrangee-connect/OnBoarding";
      const responses = await Promise.all([
        fetch(`${BASE_URL}/department-list`),
        fetch(`${BASE_URL}/designation-list`),
      ]);

      const [deptRes, desRes] = await Promise.all(responses.map((r) => r.json()));

      if (deptRes?.status) setDepartmentsList(deptRes.data);
      if (desRes?.status) setDesignationsList(desRes.data);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    } finally {
      setLoadingDropdowns(false);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`/api/documents/list/${id}`, config);
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }, [id]);

  const fetchHrAdmins = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get("/api/employees", config);
      const hrs = data.filter(
        (emp) =>
          (emp.role === "HR_ADMIN" || emp.role === "HR_SUPER_ADMIN") &&
          emp.accountStatus === "ACTIVE"
      );
      setHrAdmins(hrs);
    } catch (error) {
      console.error("Error fetching HR admins:", error);
    }
  }, []);

  const fetchEmployeeDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const { data: empData } = await axios.get(`/api/employees/${id}`, config);
      const { data: formData } = await axios.get(`/api/forms/auto-fill/${id}`, config);

      if (empData.finalVerificationEmailSent === true) {
        setEmailSent(true);
      }

      const permAddr = empData.permanent_address || {};
      const mappedAddressFields = {
        addressLine1: permAddr.address_line1 || "",
        addressLine2: permAddr.address_line2 || "",
        landmark: permAddr.landmark || "",
        postOffice: permAddr.post_office || "",
        city: permAddr.city || "",
        district: permAddr.district || "",
        state: permAddr.state || "",
        pincode: permAddr.pincode || "",
        country: permAddr.country || "India",
      };

      setEmployee({ ...empData, ...formData, ...mappedAddressFields });

      setEditForm({
        department: empData.department || "",
        department_id: empData.department_id || "",
        jobTitle: empData.jobTitle || "",
        designation_id: empData.designation_id || "",
        location: empData.location || "",
        dateOfJoining: empData.dateOfJoining || "",
        personalEmail: empData.personalEmail || "",
        onboardingHrId: empData.onboardingHrId || "",
        band_id: empData.band_id || "",
        band_name: empData.band_name || "",
        band_level_id: empData.band_level_id || "",
        level_name: empData.level_name || "",
      });
    } catch (error) {
      console.error("Error fetching employee details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchEmployeeDetails();
      fetchHrAdmins();
      fetchDocuments();
      fetchDropdownData();
    }
  }, [id, fetchEmployeeDetails, fetchHrAdmins, fetchDocuments, fetchDropdownData]);

  return {
    employee,
    loading,
    hrAdmins,
    documents,
    emailSent,
    setEmailSent,
    editForm,
    setEditForm,
    departmentsList,
    designationsList,
    loadingDropdowns,
    fetchEmployeeDetails,
    fetchDocuments,
  };
};
