import React, { useState, useEffect } from "react";
import SearchableSelect from "../../UI/SearchableSelect";
import FormInputField from "../../UI/FormInputField";

const DROPDOWN_BASE_URL = import.meta.env.VITE_DROPDOWN_BASE_URL;

const AddressBlock = ({
  prefix,
  register,
  errors,
  isLocked,
  watch,
  setValue,
  trigger,
  title,
  disabledInputs = false, 
}) => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);

  const watchState = watch(`${prefix}state`);
  const watchDistrict = watch(`${prefix}district`);

  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch(`${DROPDOWN_BASE_URL}/state-list`);
        const data = await response.json();
        if (data?.status) {
          setStates(data.data);
          if (watchState) {
            const foundState = data.data.find((s) => s.state_name === watchState);
            if (foundState) setSelectedStateId(foundState.lg_state_id);
          }
        }
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    fetchStates();
  }, [watchState]); 

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
          if (watchDistrict) {
            const foundDist = data.data.find(
              (d) => d.district_name === watchDistrict
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
  }, [selectedStateId, watchDistrict]);

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

    setValue(`${prefix}state`, name);
    setValue(`${prefix}district`, "");
    setValue(`${prefix}city`, "");
    trigger([`${prefix}state`, `${prefix}district`, `${prefix}city`]);
  };

  const onDistrictChange = (id, name) => {
    setSelectedDistrictId(id);
    setCities([]);

    setValue(`${prefix}district`, name);
    setValue(`${prefix}city`, "");
    trigger([`${prefix}district`, `${prefix}city`]);
  };

  const onCityChange = (name) => {
    setValue(`${prefix}city`, name);
    trigger(`${prefix}city`);
  };

  const effectiveLock = isLocked || disabledInputs;

  return (
    <div className="border border-gray-200 rounded-lg p-5 mb-6 bg-white relative">
      {disabledInputs && !isLocked && (
        <div className="absolute inset-0 bg-gray-50 bg-opacity-50 z-10 rounded-lg pointer-events-none"></div>
      )}

      <h5 className="font-semibold text-gray-700 mb-4">{title}</h5>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <FormInputField
          label="Address Line 1"
          name={`${prefix}address_line1`}
          register={register}
          errors={errors}
          isEditing={true}
          readOnly={effectiveLock}
          required={true}
          className="relative z-20"
        />

        <FormInputField
          label="Address Line 2"
          name={`${prefix}address_line2`}
          register={register}
          errors={errors}
          isEditing={true}
          readOnly={effectiveLock}
          className="relative z-20"
        />

        <FormInputField
          label="Landmark"
          name={`${prefix}landmark`}
          register={register}
          errors={errors}
          isEditing={true}
          readOnly={effectiveLock}
          className="relative z-20"
        />

        <div className="relative z-20">
          <SearchableSelect
            label="State"
            name={`${prefix}state`}
            options={states.map((s) => ({
              id: s.lg_state_id,
              name: s.state_name,
            }))}
            value={watchState}
            onChange={(e) => {
              onStateChange(e.target.value, e.target.option?.name || "");
            }}
            placeholder="Select State"
            required={prefix === "perm_" || !disabledInputs}
            error={errors[`${prefix}state`]?.message}
            disabled={effectiveLock}
          />
        </div>

        <div className="relative z-20">
          <SearchableSelect
            label="District"
            name={`${prefix}district`}
            options={districts.map((d) => ({
              id: d.district_id,
              name: d.district_name,
            }))}
            value={watchDistrict}
            onChange={(e) => {
              onDistrictChange(e.target.value, e.target.option?.name || "");
            }}
            placeholder="Select District"
            disabled={!selectedStateId || loadingRegions || effectiveLock}
            required={prefix === "perm_" || !disabledInputs}
            error={errors[`${prefix}district`]?.message}
          />
        </div>

        <div className="relative z-20">
          <SearchableSelect
            label="City"
            name={`${prefix}city`}
            options={cities.map((v) => ({
              id: v.lg_village_id,
              name: v.village_name,
            }))}
            value={watch(`${prefix}city`)}
            onChange={(e) => onCityChange(e.target.option?.name || "")}
            placeholder="Select City"
            disabled={!selectedDistrictId || loadingRegions || effectiveLock}
            required={prefix === "perm_" || !disabledInputs}
            error={errors[`${prefix}city`]?.message}
          />
        </div>

        <FormInputField
          label="Post Office"
          name={`${prefix}post_office`}
          register={register}
          errors={errors}
          isEditing={true}
          readOnly={effectiveLock}
          required={true}
          className="relative z-20"
        />

        <FormInputField
          label="Pincode"
          name={`${prefix}pincode`}
          register={register}
          errors={errors}
          isEditing={true}
          readOnly={effectiveLock}
          required={true}
          maxLength={6}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
          className="relative z-20"
        />

        <FormInputField
          label="Country"
          name={`${prefix}country`}
          register={register}
          errors={errors}
          isEditing={true}
          readOnly={true}
          required={true}
          className="relative z-20"
        />
      </div>
    </div>
  );
};

const AddressInformationSection = ({
  register,
  errors,
  isEditing,
  fullAddress,
  setValue,
  watch,
  trigger,
  isLocked,
}) => {
  const watchSameAsPermanent = watch("comm_same_as_permanent");

  // Synchronize permanent address values to communication address when checkbox is checked
  useEffect(() => {
    if (watchSameAsPermanent) {
      const subscription = watch((value, { name, type }) => {
        // If the changed field is part of permanent address, copy it to comm
        if (name && name.startsWith("perm_")) {
          const fieldKey = name.replace("perm_", "");
          setValue(`comm_${fieldKey}`, value[name] || "");
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [watchSameAsPermanent, watch, setValue]);

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setValue("comm_same_as_permanent", isChecked);

    if (isChecked) {
      const currentValues = watch();
      [
        "address_line1",
        "address_line2",
        "landmark",
        "state",
        "district",
        "city",
        "post_office",
        "pincode",
        "country",
      ].forEach((field) => {
        setValue(`comm_${field}`, currentValues[`perm_${field}`] || "");
      });
      trigger(); // Re-validate
    }
  };

  return (
    <>
      <div className="mt-6">
        <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
          Address Information
        </h4>
      </div>

      {isEditing ? (
        <div>
          {/* Permanent Address Block */}
          <AddressBlock
            title="Permanent Address"
            prefix="perm_"
            register={register}
            errors={errors}
            isLocked={isLocked}
            watch={watch}
            setValue={setValue}
            trigger={trigger}
          />

          {/* Same as Permanent Checkbox */}
          <div className="mb-4 ml-1 flex items-center gap-2">
            <input
              type="checkbox"
              id="sameAsPermanent"
              {...register("comm_same_as_permanent")}
              onChange={handleCheckboxChange}
              disabled={isLocked}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="sameAsPermanent" className="text-sm font-medium text-gray-700">
              Communication address is same as permanent address
            </label>
          </div>

          {/* Communication Address Block */}
          <AddressBlock
            title="Communication Address"
            prefix="comm_"
            register={register}
            errors={errors}
            isLocked={isLocked}
            watch={watch}
            setValue={setValue}
            trigger={trigger}
            disabledInputs={watchSameAsPermanent}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Permanent Address
            </label>
            <p className="font-medium text-gray-800 py-1">
              {fullAddress || "-"}
            </p>
          </div>
          
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Communication Address
            </label>
            <p className="font-medium text-gray-800 py-1">
              {watchSameAsPermanent ? "Same as Permanent" : (
                [
                  watch("comm_address_line1"),
                  watch("comm_address_line2"),
                  watch("comm_landmark"),
                  watch("comm_post_office") && watch("comm_district")
                    ? `${watch("comm_post_office")}, ${watch("comm_district")}`
                    : watch("comm_post_office") || watch("comm_district"),
                  watch("comm_city") && watch("comm_pincode")
                    ? `${watch("comm_city")} - ${watch("comm_pincode")}`
                    : watch("comm_city") || watch("comm_pincode"),
                  watch("comm_state") && watch("comm_country")
                    ? `${watch("comm_state")}, ${watch("comm_country")}`
                    : watch("comm_state") || watch("comm_country"),
                ]
                  .filter(Boolean)
                  .join(", ") || "-"
              )}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AddressInformationSection;
