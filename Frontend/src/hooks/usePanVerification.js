import { useState, useEffect } from "react";
import axios from "axios";

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const usePanVerification = (
  formData,
  setValue,
  trigger,
  showAlert,
  isEditing,
) => {
  const [panVerifying, setPanVerifying] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  const [panVerificationFailed, setPanVerificationFailed] = useState(false);
  const [panFormatError, setPanFormatError] = useState(null);
  const [lastVerifiedPanData, setLastVerifiedPanData] = useState(null);

  const handleVerifyPan = async (currentDataString) => {
    if (panVerifying) return;

    const { pan_number, firstname, middlename, lastname, date_of_birth } =
      formData;

    if (!pan_number || !firstname || !lastname || !date_of_birth) {
      return; 
    }

    setPanVerifying(true);
    setPanVerificationFailed(false);
    setLastVerifiedPanData(currentDataString); 

    try {
      const dobParts = date_of_birth.split("-");
      const formattedDob = `${dobParts[2]}/${dobParts[1]}/${dobParts[0]}`;

      const payload = {
        pan: pan_number,
        name: `${firstname} ${middlename ? middlename + " " : ""}${lastname}`.trim(),
        fathername: "",
        dob: formattedDob,
      };

      const response = await axios.post("/api/pan/verify", payload);

      if (response.data.status === "00" || response.data.status === "01") {
        setPanVerified(true);
        setValue("pan_number", pan_number.toUpperCase());
        if (response.data.firstName)
          setValue("firstname", response.data.firstName);
        if (response.data.middleName)
          setValue("middlename", response.data.middleName);
        if (response.data.lastName)
          setValue("lastname", response.data.lastName);
        trigger(["firstname", "middlename", "lastname"]);
        showAlert("PAN Verified Successfully! Name updated as per PAN.", {
          type: "success",
        });
      } else {
        setPanVerificationFailed(true);
        setPanVerified(false);
        showAlert(
          response.data.statusDesc ||
            "PAN Verification Failed. Please check your details.",
          { type: "error" },
        );
      }
    } catch (error) {
      setPanVerificationFailed(true);
      setPanVerified(false);
      showAlert(
        "Verification failed. Please check your details and try again.",
        { type: "error" },
      );
    } finally {
      setPanVerifying(false);
    }
  };

  useEffect(() => {
    if (panVerified) {
      setPanFormatError(null); 
      return;
    }
    if (panVerifying || !isEditing) return;

    const { pan_number, firstname, lastname, date_of_birth } = formData;

    if (!pan_number || !firstname || !lastname || !date_of_birth) {
      setPanFormatError(null); 
      return;
    }

    const panUpper = pan_number.toUpperCase();
    if (!PAN_REGEX.test(panUpper)) {
      setPanFormatError("Invalid PAN number format (e.g. ABCPE1234F)");
      setPanVerified(false);
      return;
    }

    setPanFormatError(null);

    const currentDataString = `${panUpper}-${firstname}-${lastname}-${date_of_birth}`;
    if (lastVerifiedPanData === currentDataString) return;

    const timeoutId = setTimeout(() => {
      handleVerifyPan(currentDataString);
    }, 1000); 

    return () => clearTimeout(timeoutId);
  }, [
    formData.pan_number,
    formData.firstname,
    formData.middlename,
    formData.lastname,
    formData.date_of_birth,
    panVerified,
    panVerifying,
    isEditing,
    lastVerifiedPanData,
  ]);

  return {
    panVerifying,
    panVerified,
    setPanVerified,
    panVerificationFailed,
    panFormatError,
    handleVerifyPan,
    setLastVerifiedPanData,
  };
};
