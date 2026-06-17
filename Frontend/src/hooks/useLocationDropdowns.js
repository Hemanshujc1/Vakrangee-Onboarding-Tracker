import { useState, useEffect } from "react";

const DROPDOWN_BASE_URL = import.meta.env.VITE_DROPDOWN_BASE_URL;

const useLocationDropdowns = (stateValue, districtValue) => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [loadingRegions, setLoadingRegions] = useState(false);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch(`${DROPDOWN_BASE_URL}/state-list`);
        const data = await response.json();
        if (data?.status) {
          setStates(data.data);
          if (stateValue) {
            const foundState = data.data.find((s) => s.state_name.toLowerCase() === String(stateValue).toLowerCase());
            if (foundState) setSelectedStateId(foundState.lg_state_id);
          }
        }
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    fetchStates();
  }, [stateValue]);

  useEffect(() => {
    if (!selectedStateId) {
      setDistricts([]);
      return;
    }
    const fetchDistricts = async () => {
      setLoadingRegions(true);
      try {
        const response = await fetch(`${DROPDOWN_BASE_URL}/district-list/${selectedStateId}`);
        const data = await response.json();
        if (data?.status) {
          setDistricts(data.data);
          if (districtValue) {
            const foundDist = data.data.find((d) => d.district_name.toLowerCase() === String(districtValue).toLowerCase());
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
  }, [selectedStateId, districtValue]);

  useEffect(() => {
    if (!selectedStateId || !selectedDistrictId) {
      setCities([]);
      return;
    }
    const fetchCities = async () => {
      setLoadingRegions(true);
      try {
        const response = await fetch(`${DROPDOWN_BASE_URL}/city-list/${selectedStateId}/${selectedDistrictId}`);
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

  return {
    states,
    districts,
    cities,
    selectedStateId,
    selectedDistrictId,
    setSelectedStateId,
    setSelectedDistrictId,
    loadingRegions
  };
};

export default useLocationDropdowns;
