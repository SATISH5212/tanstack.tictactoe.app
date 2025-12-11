import {
  AuthenticationSettings,
  CommunicationSettings,
  CompensationSettings,
  ControlSensitivitySettings,
  CurrentTransformerSettings,
  DeviceConfiguration,
  DisplaySettings,
  FrequencySettings,
  PotentialTransformerSettings,
  TimingSettings,
} from "src/lib/constants/apfcSettingsConstants";
import { Button } from "src/components/ui/button";
import PasswordFormFields from "./PasswordFormFeidls";
import { updateDevicePasswordAPI } from "src/lib/services/apfc";
import ResetPasswordDialog from "src/components/core/ReserPasswordDialog";

interface Level1SettingsProps {
  levelBasedData: Record<string, any>;
  openDialog: () => void;
  closeDialog: () => void;
  open: boolean;
  apfc_id: string;
  refetchLevel1Data: () => void;
}

const Level1Settings = ({
  levelBasedData,
  openDialog,
  closeDialog,
  open,
  apfc_id,
  refetchLevel1Data,
}: any) => {
  const updateDevicePassword = async (apfc_id: string, payload: { password: string }) => {
    try {
      await updateDevicePasswordAPI(apfc_id, payload);
    } catch (error) {
      console.error("Error updating password:", error);
      throw error; // Let the dialog handle the error
    }
  };
  const handleResetPasswordClick = () => {
    openDialog();
  };

  const renderField = (setting: any) => {
    switch (setting?.type) {
      case "password":
        return (
          <div key={setting?.name} className="flex flex-col p-2">
            {setting.name === "password" && (
              <>
                <label className="mb-1 text-xs 3xl:text-sm text-gray-600">
                  {setting?.label}
                </label>
                <div className="flex items-center gap-2">
                  <PasswordFormFields
                    name={setting?.name}
                    value={levelBasedData}
                  />
                  <Button
                    variant="ghost"
                    onClick={handleResetPasswordClick}
                    className="text-xs 3xl:text-sm text-orange-500 hover:text-orange-600 capitalize"
                    type="button" // Explicitly set type to avoid form submission
                  >
                    Reset password
                  </Button>
                </div>
              </>
            )}
          </div>
        );
      default:
        return (
          <div key={setting?.name} className="flex flex-col p-2">
            <label className="mb-1 text-xs 3xl:text-sm text-gray-600">
              {setting?.label}
            </label>
            <span className="text-smd 3xl:text-base text-gray-800">
              {levelBasedData[setting?.name] || "--"}
              {levelBasedData[setting?.name] ? setting?.unit : ""}
            </span>
          </div>
        );
    }
  };

  const settingsGroups = [
    { title: "Authentication Settings", settings: AuthenticationSettings },
    { title: "Device Configuration", settings: DeviceConfiguration },
    {
      title: "Current Transformer (CT) Settings",
      settings: CurrentTransformerSettings,
    },
    {
      title: "Potential Transformer (PT) Settings",
      settings: PotentialTransformerSettings,
    },
    { title: "Compensation Settings", settings: CompensationSettings },
    { title: "Timing", settings: TimingSettings },
    {
      title: "Control Sensitivity Settings",
      settings: ControlSensitivitySettings,
    },
    { title: "Communication Settings", settings: CommunicationSettings },
    { title: "Display Settings", settings: DisplaySettings },
  ];

  return (
    <div className="flex flex-col border border-gray-200 rounded-lg">
      {[0, 5].map((startIdx) => (
        <div
          key={startIdx}
          className="flex-1 bg-white p-2 rounded-lg "
        >
          {settingsGroups.slice(startIdx, startIdx + 5).map((group, idx) => (
            <div key={group?.title} className="mb-4">
              <h3
                className={`text-xs 3xl:text-smd 3xl:text-base font-medium text-gray-900 border-b border-gray-300 pb-2 mb-2 ${idx !== 0 ? "pt-2" : ""
                  }`}
              >
                {group?.title}
              </h3>
              <div
                className={`grid gap-4 ${group?.title === "Timing"
                  ? "grid-cols-[100px_auto]"
                  : "grid-cols-3"
                  }`}
              >
                {group?.settings.map(renderField)}
              </div>
            </div>
          ))}
        </div>
      ))}
      <ResetPasswordDialog
        apfc_id={apfc_id}
        updateDevicePassword={updateDevicePassword}
        open={open}
        closeDialog={closeDialog}
        refetchLevel1Data={refetchLevel1Data}
      />
    </div>
  );
};

export default Level1Settings;