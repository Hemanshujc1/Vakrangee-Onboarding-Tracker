import { useState } from "react";
import axios from "axios";
import { useAlert } from "../../../context/AlertContext";

export const useEmployeeActions = (id, fetchEmployeeDetails) => {
  const [isEditing, setIsEditing] = useState(false);
  const { showAlert, showConfirm } = useAlert();

  const handleSave = async (editForm, setActionLoading) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        ...editForm,
        department_id: editForm.department_id === "" ? null : editForm.department_id,
        designation_id: editForm.designation_id === "" ? null : editForm.designation_id,
        onboardingHrId: editForm.onboardingHrId === "" ? null : editForm.onboardingHrId,
        band_id: editForm.band_id === "" ? null : Number(editForm.band_id),
        band_level_id: editForm.band_level_id === "" ? null : Number(editForm.band_level_id),
        band_name: editForm.band_name || null,
        level_name: editForm.level_name || null,
      };

      await axios.put(`/api/employees/${id}`, payload, config);

      await fetchEmployeeDetails();
      setIsEditing(false);
      await showAlert("Details updated successfully!", { type: "success" });
    } catch (error) {
      console.error("Error updating details:", error);
      await showAlert("Failed to update details.", { type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdvanceStage = async (newStage, setActionLoading) => {
    const isConfirmed = await showConfirm(
      `Are you sure you want to advance this employee to ${newStage}?`
    );
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
      await showAlert(`Stage advanced to ${newStage}`, { type: "success" });
    } catch (error) {
      console.error("Error advancing stage:", error);
      await showAlert("Failed to advance stage.", { type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFormAccess = async (formType, category, currentStatus) => {
    const isConfirmed = await showConfirm(
      `Are you sure you want to ${
        currentStatus ? "ENABLE" : "DISABLE"
      } this form for the employee?`,
      { type: "warning" }
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

      await fetchEmployeeDetails();
      await showAlert(
        `Form access ${newStatus ? "DISABLED" : "ENABLED"} successfully.`,
        { type: "success" }
      );
    } catch (error) {
      console.error("Error toggling form access:", error);
      await showAlert("Failed to update form access.", { type: "error" });
    }
  };

  return {
    isEditing,
    setIsEditing,
    handleSave,
    handleAdvanceStage,
    handleToggleFormAccess,
  };
};
