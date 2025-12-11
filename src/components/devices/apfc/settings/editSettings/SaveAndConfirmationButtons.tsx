import { Button } from "src/components/ui/button";
import {
  addfanDeviceSettingsAPI,
  addLeve1DeviceSettingsAPI,
  addLeve2DeviceSettingsAPI,
  addLeve3DeviceSettingsAPI,
} from "src/lib/services/apfc";
import { useLocation, useParams, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

interface SaveAndConfirmationButtonsProps {
  formData: any;
  refetchData: () => void;
  setErrorMessages: (errors: any) => void;
}

const SaveAndConfirmationButtons = ({
  formData,
  refetchData,
  setErrorMessages,
}: SaveAndConfirmationButtonsProps) => {
  const router = useRouter();
  const { pathname } = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [loading, setLoading] = useState<boolean>(false);
  const { apfc_id } = useParams({ strict: false }) as {
    apfc_id: string;
  };

  const getLevelBasedAPI = (payload: any) => {
    switch (searchParams.get("state")) {
      case "Level1":
        return addLeve1DeviceSettingsAPI(apfc_id, payload);
      case "Level2":
        return addLeve2DeviceSettingsAPI(apfc_id, payload);
      case "Level3":
        return addLeve3DeviceSettingsAPI(apfc_id, payload);
      case "Level4":
        return addfanDeviceSettingsAPI(apfc_id, payload);
      default:
        return addLeve1DeviceSettingsAPI(apfc_id, payload);
    }
  };

  const navigateToNextStep = () => {
    const currentState = searchParams.get("state");
    const nextSteps: { [key: string]: string } = {
      Level1: `${pathname}?state=Level2`,
      Level2: `${pathname}?state=Level3`,
      Level3: `${pathname}?state=Level4`,
      Level4: `/apfc/${apfc_id}/settings?state=Level1`,
    };
    router.navigate({ to: nextSteps[currentState || "Level1"] });
  };

  const prepareLevel2Payload = () => ({
    created_at: formData?.created_at ?? null,
    created_by: formData?.created_by ?? null,
    ct_polarity_error: formData?.ct_polarity_error ?? "OFF",
    device_id: formData?.device_id ?? null,
    factory_default: formData?.factory_default ?? "OFF",
    fan_setting: formData?.fan_setting ?? "OFF",
    histeresis_pf: formData?.histeresis_pf ?? null,
    histeresis_voltage: formData?.histeresis_voltage ?? null,
    id: formData?.id ?? null,
    no_volt: formData?.no_volt ?? "OFF",
    over_compensate: formData?.over_compensate ?? "OFF",
    over_temperature: formData?.over_temperature ?? "OFF",
    over_temperature_setting: formData?.over_temperature_setting ?? null,
    over_volt: formData?.over_volt ?? "OFF",
    reset_energy: formData?.reset_energy ?? "OFF",
    reset_energy_password: formData?.reset_energy_password ?? null,
    reset_kvah: formData?.reset_kvah ?? "OFF",
    reset_kvarh: formData?.reset_kvarh ?? "OFF",
    reset_kwh: formData?.reset_kwh ?? "OFF",
    set_max_over_volt: formData?.set_max_over_volt ?? null,
    set_min_over_volt: formData?.set_min_over_volt ?? null,
    step_error: formData?.step_error ?? "OFF",
    step_error_setting: formData?.step_error_setting ?? null,
    thd_i_range: formData?.thd_i_range ?? null,
    total_harmonic_distortion: formData?.total_harmonic_distortion ?? "OFF",
    trip_time: formData?.trip_time ?? "OFF",
    under_compensate: formData?.under_compensate ?? "OFF",
    under_volt: formData?.under_volt ?? "OFF",
    updated_at: formData?.updated_at ?? null,
    updated_by: formData?.updated_by ?? null,
  });

  const prepareLevel3Payload = () => ({
    created_at: formData?.created_at ?? null,
    created_by: formData?.created_by ?? null,
    device_id: formData?.device_id ?? null,
    id: formData?.id ?? null,
    relay1: formData?.relay1 ?? "OFF",
    relay2: formData?.relay2 ?? "OFF",
    relay3: formData?.relay3 ?? "OFF",
    relay4: formData?.relay4 ?? "OFF",
    relay5: formData?.relay5 ?? "OFF",
    relay6: formData?.relay6 ?? "OFF",
    relay7: formData?.relay7 ?? "OFF",
    relay8: formData?.relay8 ?? "OFF",
    relay9: formData?.relay9 ?? "OFF",
    relay10: formData?.relay10 ?? "OFF",
    relay11: formData?.relay11 ?? "OFF",
    relay12: formData?.relay12 ?? "OFF",
    relay13: formData?.relay13 ?? "OFF",
    relay14: formData?.relay14 ?? "OFF",
    updated_at: formData?.updated_at ?? null,
    updated_by: formData?.updated_by ?? null,
  });

  const addLevelBasedSettings = async () => {
    setLoading(true);
    let payload = formData;

    if (searchParams.get("state") === "Level2") {
      payload = prepareLevel2Payload();
    } else if (searchParams.get("state") === "Level3") {
      payload = prepareLevel3Payload();
    }

    try {
      const response = await getLevelBasedAPI(payload);
      if (response?.status === 200 || response?.status === 201) {
        await refetchData();
        setErrorMessages({});
        toast.success(response?.message || "Settings updated successfully");
        navigateToNextStep();
      } else if (response.status === 422) {
        // Safely handle error data, using message or a generic fallback
        const errorData = response.message || "Validation failed";
        setErrorMessages({ general: errorData });
        toast.error("Validation error. Please check your inputs.");
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (err) {
      console.error(err);
      setErrorMessages({
        general: "Failed to update settings. Please try again.",
      });
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };
  const handleBack = () => {
    router.history.back();
  };

  return (
    <div className="flex justify-end gap-4 pt-4 ">
      <Button
        variant="outline"
        className="!text-red-500 border-0 hover:border-0 bg-transparent hover:bg-transparent h-auto px-8 py-2 text-smd 3xl:text-base "
        onClick={handleBack}
        disabled={loading}
      >
        Cancel
      </Button>
      <Button
        className="bg-red-500  hover:bg-red-500 h-auto px-8 py-2 text-smd 3xl:text-base  !text-white"
        onClick={addLevelBasedSettings}
        disabled={loading}
      >
        {loading
          ? "Processing..."
          : searchParams.get("state") === "Level4"
            ? "Submit"
            : "Save & Continue"}
      </Button>
    </div>
  );
};

export default SaveAndConfirmationButtons;