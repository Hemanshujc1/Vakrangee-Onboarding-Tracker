import { useState, useCallback } from "react";
import axios from "axios";

export const useDocumentManager = (showAlert, showConfirm) => {
  const [documents, setDocuments] = useState([]);
  const [uploadingState, setUploadingState] = useState({});

  const fetchDocuments = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/documents", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching docs:", error);
    }
  }, []);

  const handleUpload = async (file, docType) => {
    if (!file) return;
    const token = localStorage.getItem("token");
    setUploadingState((prev) => ({ ...prev, [docType]: true }));

    const formData = new FormData();
    formData.append("documentType", docType);
    formData.append("file", file);

    try {
      await axios.post("/api/documents/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchDocuments();
      showAlert("Document uploaded successfully!", { type: "success" });
    } catch (error) {
      console.error("Upload failed:", error);
      showAlert("Upload failed. Please try again.", { type: "error" });
    } finally {
      setUploadingState((prev) => ({ ...prev, [docType]: false }));
    }
  };

  const handleDelete = async (docId) => {
    const isConfirmed = await showConfirm(
      "Are you sure you want to delete this document?",
      { type: "warning" }
    );
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDocuments();
      showAlert("Document deleted successfully.", { type: "success" });
    } catch (error) {
      console.error("Delete error:", error);
      showAlert("Failed to delete.", { type: "error" });
    }
  };

  const getDocStatus = useCallback(
    (docKey) => {
      const doc = documents.find((d) => d.document_type === docKey);
      if (doc) {
        return {
          status: doc.status.toUpperCase(),
          data: doc,
        };
      }
      return { status: "PENDING", data: null };
    },
    [documents]
  );

  return {
    documents,
    uploadingState,
    fetchDocuments,
    handleUpload,
    handleDelete,
    getDocStatus,
  };
};
