import React, { useState, useEffect } from "react";
import SearchableSelect from "../../UI/SearchableSelect";

const AddressInformationSection = ({
  register,
  errors,
  isEditing,
  fullAddress,
  setValue,
  watch,
  trigger,
}) => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);

  const watchState = watch("state");
  const watchDistrict = watch("district");

  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");

  const DROPDOWN_BASE_URL = "/vakrangee-connect/OnBoarding";

  // Fetch States on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch(`${DROPDOWN_BASE_URL}/state-list`);
        const data = await response.json();
        if (data?.status) {
          setStates(data.data);

          if (watchState) {
            const foundState = data.data.find(
              (s) => s.state_name === watchState,
            );
            if (foundState) setSelectedStateId(foundState.lg_state_id);
          }
        }
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    fetchStates();
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
          `${DROPDOWN_BASE_URL}/district-list/${selectedStateId}`,
        );
        const data = await response.json();
        if (data?.status) {
          setDistricts(data.data);

          if (watchDistrict) {
            const foundDist = data.data.find(
              (d) => d.district_name === watchDistrict,
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
          `${DROPDOWN_BASE_URL}/city-list/${selectedStateId}/${selectedDistrictId}`,
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

    setValue("state", name);
    setValue("district", "");
    setValue("city", "");
    trigger(["state", "district", "city"]);
  };

  const onDistrictChange = (id, name) => {
    setSelectedDistrictId(id);
    setCities([]);

    setValue("district", name);
    setValue("city", "");
    trigger(["district", "city"]);
  };

  const onCityChange = (name) => {
    setValue("city", name);
    trigger("city");
  };

  return (
    <>
      <div className="md:col-span-2 mt-8">
        <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
          Address Information
        </h4>
      </div>

      {isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 md:col-span-2">
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              {...register("address_line1")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.address_line1 ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.address_line1 && (
              <p className="text-red-500 text-xs mt-1">
                {errors.address_line1.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Address Line 2
            </label>
            <input
              {...register("address_line2")}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">Landmark</label>
            <input
              {...register("landmark")}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <SearchableSelect
            label="State"
            name="state"
            options={states.map((s) => ({
              id: s.lg_state_id,
              name: s.state_name,
            }))}
            value={watchState}
            onChange={(e) => {
              onStateChange(e.target.value, e.target.option.name);
            }}
            placeholder="Select State"
            required
            error={errors.state?.message}
          />

          <SearchableSelect
            label="District"
            name="district"
            options={districts.map((d) => ({
              id: d.district_id,
              name: d.district_name,
            }))}
            value={watchDistrict}
            onChange={(e) => {
              onDistrictChange(e.target.value, e.target.option.name);
            }}
            placeholder="Select District"
            disabled={!selectedStateId || loadingRegions}
            required
            error={errors.district?.message}
          />

          <SearchableSelect
            label="City"
            name="city"
            options={cities.map((v) => ({
              id: v.lg_village_id,
              name: v.village_name,
            }))}
            value={watch("city")}
            onChange={(e) => onCityChange(e.target.option.name)}
            placeholder="Select City"
            disabled={!selectedDistrictId || loadingRegions}
            required
            error={errors.city?.message}
          />

          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Post Office
            </label>
            <input
              {...register("post_office")}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Pincode <span className="text-red-500">*</span>
            </label>
            <input
              {...register("pincode")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.pincode ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.pincode && (
              <p className="text-red-500 text-xs mt-1">
                {errors.pincode.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Country <span className="text-red-500">*</span>
            </label>
            <input
              {...register("country")}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
              disabled
            />
            {errors.country && (
              <p className="text-red-500 text-xs mt-1">
                {errors.country.message}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-500 mb-1">
            Full Address
          </label>
          <p className="font-medium text-gray-800 py-2">{fullAddress || "-"}</p>
        </div>
      )}
    </>
  );
};

export default AddressInformationSection;
