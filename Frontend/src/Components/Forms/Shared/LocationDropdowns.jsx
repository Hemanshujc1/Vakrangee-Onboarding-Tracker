import React from "react";
import SearchableSelect from "../../UI/SearchableSelect";
import useLocationDropdowns from "../../../hooks/useLocationDropdowns";

const LocationDropdowns = ({ prefix, watch, setValue, errors, required = true, disabled = false }) => {
  const stateField = `${prefix}state`;
  const districtField = `${prefix}district`;
  const cityField = `${prefix}city`;

  const stateValue = watch(stateField);
  const districtValue = watch(districtField);
  const cityValue = watch(cityField);

  const {
    states,
    districts,
    cities,
    selectedStateId,
    selectedDistrictId,
    loadingRegions,
  } = useLocationDropdowns(stateValue, districtValue);

  const handleStateChange = (name) => {
    setValue(stateField, name, { shouldValidate: true, shouldDirty: true });
    setValue(districtField, "", { shouldValidate: true, shouldDirty: true });
    setValue(cityField, "", { shouldValidate: true, shouldDirty: true });
  };

  const handleDistrictChange = (name) => {
    setValue(districtField, name, { shouldValidate: true, shouldDirty: true });
    setValue(cityField, "", { shouldValidate: true, shouldDirty: true });
  };

  const handleCityChange = (name) => {
    setValue(cityField, name, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <>
      <SearchableSelect
        label="State"
        name={stateField}
        options={states.map((s) => ({
          id: s.lg_state_id,
          name: s.state_name,
        }))}
        value={stateValue || ""}
        onChange={(e) => handleStateChange(e.target.option?.name || "")}
        placeholder="State"
        required={required}
        disabled={disabled}
        error={errors[stateField]?.message}
      />
      <SearchableSelect
        label="District"
        name={districtField}
        options={districts.map((d) => ({
          id: d.district_id,
          name: d.district_name,
        }))}
        value={districtValue || ""}
        onChange={(e) => handleDistrictChange(e.target.option?.name || "")}
        placeholder="District"
        disabled={disabled || !selectedStateId || loadingRegions}
        required={required}
        error={errors[districtField]?.message}
      />
      <SearchableSelect
        label="City"
        name={cityField}
        options={cities.map((c) => ({
          id: c.lg_village_id,
          name: c.village_name,
        }))}
        value={cityValue || ""}
        onChange={(e) => handleCityChange(e.target.option?.name || "")}
        placeholder="City"
        disabled={disabled || !selectedDistrictId || loadingRegions}
        required={required}
        error={errors[cityField]?.message}
      />
    </>
  );
};

export default LocationDropdowns;
