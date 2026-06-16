import { useState } from "react";

export const useToggleSections = (initialState) => {
  const [openSections, setOpenSections] = useState(initialState);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return [openSections, toggleSection];
};
