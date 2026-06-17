import React, { useState, useEffect } from "react";
import SearchableSelect from "./SearchableSelect";

const DROPDOWN_BASE_URL = import.meta.env.VITE_DROPDOWN_BASE_URL;

const WorkLocationPicker = ({ location, setLocation, layout = "vertical", errors = {} }) => {
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
          if (location.state) {
            const foundState = data.data.find((s) => s.state_name.toLowerCase() === String(location.state).toLowerCase());
            if (foundState) setSelectedStateId(foundState.lg_state_id);
          }
        }
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    fetchStates();
  }, [location.state]);

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
          if (location.district) {
            const foundDist = data.data.find((d) => d.district_name.toLowerCase() === String(location.district).toLowerCase());
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
  }, [selectedStateId, location.district]);

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

  const handleStateChange = (id, name) => {
    setSelectedStateId(id);
    setSelectedDistrictId("");
    setDistricts([]);
    setCities([]);
    setLocation((prev) => ({ ...prev, state: name, district: "", city: "" }));
  };

  const handleDistrictChange = (id, name) => {
    setSelectedDistrictId(id);
    setCities([]);
    setLocation((prev) => ({ ...prev, district: name, city: "" }));
  };

  const handleCityChange = (name) => {
    setLocation((prev) => ({ ...prev, city: name }));
  };

  return (
    <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-4">
      <h3 className="text-sm font-medium text-gray-700">
        Work Location <span className="text-red-500">*</span>
      </h3>
      <div className={`grid gap-4 ${layout === "horizontal" ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"}`}>
        <SearchableSelect
          label="State"
          name="state"
          options={states.map((s) => ({
            id: s.lg_state_id,
            name: s.state_name,
          }))}
          value={location.state}
          onChange={(e) => handleStateChange(e.target.value, e.target.option?.name || "")}
          placeholder="State"
          required
          error={errors["work_location.state"]?.message}
        />
        <SearchableSelect
          label="District"
          name="district"
          options={districts.map((d) => ({
            id: d.district_id,
            name: d.district_name,
          }))}
          value={location.district}
          onChange={(e) => handleDistrictChange(e.target.value, e.target.option?.name || "")}
          placeholder="District"
          disabled={!selectedStateId || loadingRegions}
          required
          error={errors["work_location.district"]?.message}
        />
        <SearchableSelect
          label="City"
          name="city"
          options={cities.map((c) => ({
            id: c.lg_village_id,
            name: c.village_name,
          }))}
          value={location.city}
          onChange={(e) => handleCityChange(e.target.option?.name || "")}
          placeholder="City"
          disabled={!selectedDistrictId || loadingRegions}
          required
          error={errors["work_location.city"]?.message}
        />
      </div>
    </div>
  );
};


export default WorkLocationPicker;
