import { useState, useEffect } from "react";

const DROPDOWN_BASE_URL = import.meta.env.VITE_DROPDOWN_BASE_URL;

export const useRegionDropdowns = (formData, handleInputChange) => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);

  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");

  // Fetch States on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch(`${DROPDOWN_BASE_URL}/state-list`);
        const data = await response.json();
        if (data?.status) {
          setStates(data.data);

          // If we have an initial state name, try to find its ID for subsequent fetches
          if (formData.state) {
            const foundState = data.data.find(
              (s) => s.state_name === formData.state
            );
            if (foundState) setSelectedStateId(foundState.lg_state_id);
          }
        }
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    fetchStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          `${DROPDOWN_BASE_URL}/district-list/${selectedStateId}`
        );
        const data = await response.json();
        if (data?.status) {
          setDistricts(data.data);

          // If we have an initial district name, try to find its ID for subsequent fetches
          if (formData.district) {
            const foundDist = data.data.find(
              (d) => d.district_name === formData.district
            );
            if (foundDist) setSelectedDistrictId(foundDist.district_id);
          }
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
      } finally {
        setLoadingRegions(false);
      }
    };
    fetchDistricts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          `${DROPDOWN_BASE_URL}/city-list/${selectedStateId}/${selectedDistrictId}`
        );
        const data = await response.json();
        if (data?.status) {
          setCities(data.data);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setLoadingRegions(false);
      }
    };
    fetchCities();
  }, [selectedDistrictId, selectedStateId]);

  const onStateChange = (id, name) => {
    setSelectedStateId(id);
    setSelectedDistrictId("");
    setDistricts([]);
    setCities([]);

    // Update parent formData
    handleInputChange({ target: { name: "state", value: name } });
    handleInputChange({ target: { name: "district", value: "" } });
    handleInputChange({ target: { name: "city", value: "" } });
  };

  const onDistrictChange = (id, name) => {
    setSelectedDistrictId(id);
    setCities([]);

    // Update parent formData
    handleInputChange({ target: { name: "district", value: name } });
    handleInputChange({ target: { name: "city", value: "" } });
  };

  const onCityChange = (name) => {
    handleInputChange({ target: { name: "city", value: name } });
  };

  return {
    states,
    districts,
    cities,
    loadingRegions,
    selectedStateId,
    selectedDistrictId,
    onStateChange,
    onDistrictChange,
    onCityChange,
  };
};
