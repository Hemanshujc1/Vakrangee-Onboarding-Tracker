import { useState, useEffect } from "react";

const DROPDOWN_BASE_URL = import.meta.env.VITE_DROPDOWN_BASE_URL;

export const useDropdowns = (isOpen) => {
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

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

    fetchDropdownData();
  }, [isOpen]);

  return { departments, designations, loadingDropdowns };
};
