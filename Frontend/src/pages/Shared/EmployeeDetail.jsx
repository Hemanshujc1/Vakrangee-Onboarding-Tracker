import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import { ArrowLeft, Pencil, Save, X, Briefcase } from "lucide-react";
import axios from "axios";
import { useAlert } from "../../context/AlertContext";
import ProfileHeader from "../../Components/EmployeeDetail/ProfileHeader";
import PersonalInfoGrid from "../../Components/EmployeeDetail/PersonalInfoGrid";
import AddressCard from "../../Components/EmployeeDetail/AddressCard";
import EducationIdentityCard from "../../Components/EmployeeDetail/EducationIdentityCard";
import VerificationActionCard from "../../Components/EmployeeDetail/VerificationActionCard";
import DocumentList from "../../Components/EmployeeDetail/DocumentList";
import FormSection from "../../Components/EmployeeDetail/FormSection";
import FormRow from "../../Components/EmployeeDetail/FormRow";

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useAlert();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [hrAdmins, setHrAdmins] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [editForm, setEditForm] = useState({
    department: "",
    jobTitle: "",
    location: "",
    dateOfJoining: "",
    personalEmail: "",
    onboardingHrId: "",
  });

  useEffect(() => {
    fetchEmployeeDetails();
    fetchHrAdmins();
    fetchDocuments();
  }, [id]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`/api/documents/list/${id}`, config);
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const fetchHrAdmins = async () => {
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
  };

  const fetchEmployeeDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // 1. Fetch Basic Info
      const { data: empData } = await axios.get(`/api/employees/${id}`, config);

      // 2. Fetch Form Data (AutoFill) to get statuses and details
      const { data: formData } = await axios.get(
        `/api/forms/auto-fill/${id}`,
        config
      );

      // Merge Data
      setEmployee({ ...empData, ...formData });

      setEditForm({
        department: empData.department || "",
        jobTitle: empData.jobTitle || "",
        location: empData.location || "",
        dateOfJoining: empData.dateOfJoining || "",
        personalEmail: empData.personalEmail || "",
        email: empData.email || "",
        onboardingHrId: empData.assignedHR?.id || "",
      });
    } catch (error) {
      console.error("Error fetching employee details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.put(`/api/employees/${id}`, editForm, config);

      await fetchEmployeeDetails();
      setIsEditing(false);
      await showAlert("Details updated successfully!", { type: 'success' });
    } catch (error) {
      console.error("Error updating details:", error);
      await showAlert("Failed to update details.", { type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerificationAction = async (status, reason = null) => {
    const isConfirmed = await showConfirm(
        `Are you sure you want to ${status === "VERIFIED" ? "verify" : "reject"} this profile?`, 
        { type: status === "VERIFIED" ? "info" : "warning" }
    );
    if (!isConfirmed) return;

    if (status === "REJECTED" && !reason) {
      reason = prompt("Please enter a reason for rejection:");
      if (!reason) return; // Cancelled if no reason provided
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/employees/${id}/verify-basic-info`,
        {
          status,
          rejectionReason: reason,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchEmployeeDetails();
      await showAlert(`Profile ${status === "VERIFIED" ? "verified" : "rejected"} successfully.`, { type: 'success' });
    } catch (error) {
      console.error("Error verifying profile:", error);
      await showAlert("Failed to update status.", { type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDocumentVerification = async (docId, status) => {
    const isConfirmed = await showConfirm(
        `Are you sure you want to ${status === "VERIFIED" ? "verify" : "reject"} this document?`,
        { type: status === "VERIFIED" ? "info" : "warning" }
    );
    if (!isConfirmed) return;

    let reason = null;
    if (status === "REJECTED") {
      reason = prompt("Please enter a reason for rejection:");
      if (!reason) return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/documents/verify/${docId}`,
        {
          status,
          rejectionReason: reason,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchDocuments();
      await showAlert(`Document ${status === "VERIFIED" ? "verified" : "rejected"} successfully.`, { type: 'success' });
    } catch (error) {
      console.error("Error verifying document:", error);
      await showAlert("Failed to update document status.", { type: 'error' });
    }
  };

  const handleAdvanceStage = async (newStage) => {
    const isConfirmed = await showConfirm(`Are you sure you want to advance this employee to ${newStage}?`);
    if (!isConfirmed) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/employees/${id}/advance-stage`,
        { stage: newStage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchEmployeeDetails();
      await showAlert(`Stage advanced to ${newStage}`, { type: 'success' });
    } catch (error) {
      console.error("Error advancing stage:", error);
      await showAlert("Failed to advance stage.", { type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFormAccess = async (formType, category, currentStatus) => {
    const isConfirmed = await showConfirm(
        `Are you sure you want to ${currentStatus ? "ENABLE" : "DISABLE"} this form for the employee?`,
        { type: 'warning' }
    );
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const newStatus = !currentStatus; // Toggle

      await axios.put(
        `/api/employees/${id}/form-access`,
        {
          formKey: formType,
          disabled: newStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchEmployeeDetails(); // Refresh to get new status
      await showAlert(`Form access ${newStatus ? "DISABLED" : "ENABLED"} successfully.`, { type: 'success' });
    } catch (error) {
      console.error("Error toggling form access:", error);
      await showAlert("Failed to update form access.", { type: 'error' });
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <div className="p-10 text-center text-gray-500">Loading profile...</div>
      </DashboardLayout>
    );
  if (!employee)
    return (
      <DashboardLayout>
        <div className="p-10 text-center text-gray-500">
          Employee not found.
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              <span>Back to List</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-800">
              Employee Profile
            </h1>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-all font-medium shadow-sm"
            >
              <Pencil size={18} />
              <span>Edit Details</span>
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    department: employee.department || "",
                    jobTitle: employee.jobTitle || "",
                    location: employee.location || "",
                    dateOfJoining: employee.dateOfJoining || "",
                    personalEmail: employee.personalEmail || "",
                    onboardingHrId: employee.assignedHR?.id || "",
                  });
                }}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                <X size={18} />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-all font-medium shadow-sm disabled:opacity-70"
              >
                <Save size={18} />
                <span>{actionLoading ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          )}
        </div>

        <ProfileHeader
          employee={employee}
          isEditing={isEditing}
          editForm={editForm}
          setEditForm={setEditForm}
        >
          <PersonalInfoGrid
            employee={employee}
            isEditing={isEditing}
            editForm={editForm}
            setEditForm={setEditForm}
            hrAdmins={hrAdmins}
          />
        </ProfileHeader>

        <VerificationActionCard
          employee={employee}
          handleVerificationAction={handleVerificationAction}
          actionLoading={actionLoading}
        />
        
        {/* Stage Progression Control */}
        {employee.onboardingStage === 'PRE_JOINING_VERIFIED' && (
             <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 flex justify-between items-center">
                 <div>
                     <h3 className="text-lg font-bold text-gray-800">Ready for Joining</h3>
                     <p className="text-sm text-gray-500">Employee has completed all Pre-Joining requirements.</p>
                 </div>
                 <button 
                    onClick={() => handleAdvanceStage('POST_JOINING')}
                    disabled={actionLoading}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                 >
                    Start Post-Joining
                 </button>
             </div>
        )}
        

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AddressCard employee={employee} />
          <EducationIdentityCard employee={employee} />
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <FormSection title="Pre-Joining Forms" icon={Briefcase}>
        

            <FormRow
              title="Employment Application Form"
              status={employee.applicationStatus}
              isDisabled={employee.applicationDisabled}
              onToggle={() =>
                handleToggleFormAccess(
                  "EMPLOYMENT_APP",
                  "PRE",
                  employee.applicationDisabled
                )
              }
              onView={() =>
                navigate(`/forms/application/preview/${employee.id}`)
              }
              verifiedByName={employee.applicationVerifiedByName}
            />

            <FormRow
              title="Mediclaim Form"
              status={employee.mediclaimStatus}
              isDisabled={employee.mediclaimDisabled}
              onToggle={() =>
                handleToggleFormAccess(
                  "MEDICLAIM",
                  "PRE",
                  employee.mediclaimDisabled
                )
              }
              onView={() =>
                navigate(`/forms/mediclaim/preview/${employee.id}`, {
                  state: {
                    formData: {
                      ...(employee.mediclaimData || {}),
                      signature_path: employee.mediclaimData?.signature_path || employee.signature,
                      employee_full_name: employee.mediclaimData?.employee_full_name || employee.fullName
                    },
                    status: employee.mediclaimStatus,
                    isHR: true,
                    employeeId: employee.id,
                  },
                })
              }
              verifiedByName={employee.mediclaimVerifiedByName}
            />

            <FormRow
              title="Gratuity Form (Form F)"
              status={employee.gratuityStatus}
              isDisabled={employee.gratuityDisabled} 
              onToggle={() =>
                handleToggleFormAccess(
                  "GRATUITY",
                  "PRE",
                  employee.gratuityDisabled
                )
              }
              onView={() =>
                navigate(`/forms/gratuity-form/preview/${employee.id}`, {
                  state: {
                    formData: {
                      ...(employee.gratuityData || {}),
                      signature_path: employee.gratuityData?.signature_path || employee.signature,
                      employee_full_name: employee.gratuityData?.employee_full_name || employee.fullName
                    },
                    status: employee.gratuityStatus,
                    isHR: true,
                    employeeId: employee.id,
                  },
                })
              }
              verifiedByName={employee.gratuityVerifiedByName}
            />

            <FormRow
              title="Employment Information Form"
              status={employee.employeeInfoStatus}
              isDisabled={employee.employeeInfoDisabled}
              onToggle={() =>
                handleToggleFormAccess(
                  "EMPLOYEE_INFO",
                  "PRE",
                  employee.employeeInfoDisabled
                )
              }
              onView={() => navigate(`/forms/information/preview/${employee.id}`)}
              verifiedByName={employee.employeeInfoVerifiedByName}
            />
            
          </FormSection>

          <FormSection title="Post-Joining Forms" icon={Briefcase}>
            <FormRow
              title="Non-Disclosure Agreement (NDA)"
              status={employee.ndaStatus}
              isDisabled={employee.ndaDisabled}
              onToggle={() =>
                handleToggleFormAccess("NDA", "POST", employee.ndaDisabled)
              }
              onView={() =>
                navigate(`/forms/non-disclosure-agreement/preview/${employee.id}`, {
                  state: {
                    formData: {
                      ...(employee.ndaData || {}),
                      signature_path: employee.ndaData?.signature_path || employee.signature,
                      employee_full_name: employee.ndaData?.employee_full_name || employee.fullName
                    },
                    status: employee.ndaStatus,
                    isHR: true,
                    employeeId: employee.id,
                  },
                })
              }
              verifiedByName={employee.ndaVerifiedByName}
            />

            <FormRow
              title="Declaration Form"
              status={employee.declarationStatus}
              isDisabled={employee.declarationDisabled}
              onToggle={() =>
                handleToggleFormAccess(
                  "DECLARATION",
                  "POST",
                  employee.declarationDisabled
                )
              }
              onView={() =>
                navigate(`/forms/declaration-form/preview/${employee.id}`, {
                  state: {
                    formData: {
                      ...(employee.declarationData || {}),
                      signature_path: employee.declarationData?.signature_path || employee.signature,
                      employee_full_name: employee.declarationData?.employee_full_name || employee.fullName
                    },
                    status: employee.declarationStatus,
                    isHR: true,
                    employeeId: employee.id,
                  },
                })
              }
              verifiedByName={employee.declarationVerifiedByName}
            />

            <FormRow
              title="TDS Declaration Form"
              status={employee.tdsStatus}
              isDisabled={employee.tdsDisabled}
              onToggle={() =>
                handleToggleFormAccess("TDS", "POST", employee.tdsDisabled)
              }
              onView={() =>
                navigate(`/forms/tds-form/preview/${employee.id}`, {
                  state: {
                    formData: {
                      ...(employee.tdsData || {}),
                      signature_path: employee.tdsData?.signature_path || employee.signature,
                      employee_full_name: employee.tdsData?.employee_full_name || employee.fullName
                    },
                    status: employee.tdsStatus,
                    isHR: true,
                    employeeId: employee.id,
                  },
                })
              }
              verifiedByName={employee.tdsVerifiedByName}
            />

            <FormRow
              title="Employees Provident Fund (EPF) Form"
              status={employee.epfStatus}
              isDisabled={employee.epfDisabled}
              onToggle={() =>
                handleToggleFormAccess("EPF", "POST", employee.epfDisabled)
              }
              onView={() =>
                navigate(
                  `/forms/employees-provident-fund/preview/${employee.id}`,
                  {
                    state: {
                      formData: {
                        ...(employee.epfData || {}),
                        signature_path: employee.epfData?.signature_path || employee.signature,
                        member_name_aadhar: employee.epfData?.member_name_aadhar || employee.fullName
                      },
                      status: employee.epfStatus,
                      isHR: true,
                      employeeId: employee.id,
                    },
                  }
                )
              }
              verifiedByName={employee.epfVerifiedByName}
            />
          </FormSection>
        </div>

        <DocumentList
          documents={documents}
          handleDocumentVerification={handleDocumentVerification}
        />
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDetail;
