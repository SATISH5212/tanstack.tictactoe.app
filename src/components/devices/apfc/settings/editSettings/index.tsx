import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "@tanstack/react-router";
import ArrowSteppers from "./addSettingsStepper";
import {
  getfanDeviceSettingsAPI,
  getLevel1DeviceSettingsAPI,
  getLevel2DeviceSettingsAPI,
  getLevel3DeviceSettingsAPI,
  getSingleApfcDeviceAPI,
} from "src/lib/services/apfc";

import Level3Component from "./EditLevel3Component";
import Level4Component from "./EditLevel4Settings";
import FormLevel1Component from "./Level1Component";
import Level2Component from "./EditLevel2Settings";
import LoadingComponent from "src/components/core/Loading";
type LevelState = "Level1" | "Level2" | "Level3" | "Level4";

const EditSettings = () => {
  const { apfc_id } = useParams({ strict: false }) as {
    apfc_id: string;
    user_id: string;
  };
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const levelState =
    (searchParams.get("state") as LevelState | null) ?? "Level1";
  const [selectedStep, setSelectedStep] = useState<LevelState>(levelState);
  useEffect(() => {
    const newLevelState =
      (searchParams.get("state") as LevelState | null) ?? "Level1";
    if (newLevelState !== selectedStep) {
      setSelectedStep(newLevelState);
    }
  }, [location.search, searchParams, selectedStep]);

  const {
    data: levelBasedData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["deviceSettings", apfc_id, levelState],
    queryFn: async () => {
      switch (levelState) {
        case "Level1":
          return await getLevel1DeviceSettingsAPI(apfc_id);
        case "Level2":
          return await getLevel2DeviceSettingsAPI(apfc_id);
        case "Level3":
          return await getLevel3DeviceSettingsAPI(apfc_id);
        case "Level4":
          return await getfanDeviceSettingsAPI(apfc_id);
        default:
          return await getLevel1DeviceSettingsAPI(apfc_id);
      }
    },
    select: (response) => ({
      ...response.data,
      sync_frequency: response.data.sync_frequency || 5,
    }),
    enabled: !!apfc_id,
  });

  const renderLevelComponent = () => {
    switch (selectedStep) {
      case "Level1":
        return (
          <FormLevel1Component
            levelBasedData={levelBasedData?.data}
            isLoading={isLoading}
            refetchData={refetch}
          />
        );
      case "Level2":
        return (
          <Level2Component
            levelBasedData={levelBasedData?.data}
            isLoading={isLoading}
            refetchData={refetch}
          />
        );
      case "Level3":
        return (
          <Level3Component
            levelBasedData={levelBasedData?.data}
            isLoading={isLoading}
            refetchData={refetch}
          />
        );
      case "Level4":
        return (
          <Level4Component
            levelBasedData={levelBasedData?.data}
            isLoading={isLoading}
            refetchData={refetch}
          />
        );
      default:
        return <div>No component for selected step</div>;
    }
  };

  return (
    <div className="py-4 px-20 bg-gray-100  h-setting_height overflow-y-auto">
      <ArrowSteppers
        selectedStep={selectedStep}
        setSelectedStep={setSelectedStep}
      />
      {isLoading ? (
        <div className="h-apfc_device_details mt-4 overflow-y-auto relative">
          <LoadingComponent loading={isLoading} message="Loading..." />
        </div>
      ) : (
        renderLevelComponent()
      )}
    </div>
  );
};

export default EditSettings;
