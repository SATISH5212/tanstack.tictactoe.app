// Level2Settings.tsx

import {
  compensationSettings,
  errorHandlingSettings,
  factoryAndEnergySettings,
  fanAndHysteresisSettings,
  harmonicDistortionSettings,
  voltageSettings,
} from "src/lib/constants/apfcSettingsConstants";
import PasswordFormFields from "./PasswordFormFeidls";

interface Level2SettingsProps {
  levelBasedData: Record<string, any>;
}

const Level2Settings = ({ levelBasedData }: Level2SettingsProps) => {
  const renderField = (setting: any) => {
    switch (setting.type) {
      case "password":
        return (
          <div key={setting?.name} className="flex flex-col p-2">
            <label className="mb-1 text-xs 3xl:text-sm text-gray-600">
              {setting?.label}
            </label>
            <PasswordFormFields name={setting?.name} value={levelBasedData} />
          </div>
        );
      default:
        return (
          <div key={setting?.name} className="flex flex-col p-2">
            <label className="mb-1 text-xs 3xl:text-sm text-gray-600">
              {setting?.label}
            </label>
            <span
              className={`text-smd 3xl:text-base ${levelBasedData[setting?.name] === "ON"
                  ? "text-green-500"
                  : levelBasedData[setting?.name] === "OFF"
                    ? "text-orange-500"
                    : "text-gray-500"
                }`}
            >
              {levelBasedData[setting?.name] || "--"}
              {levelBasedData[setting?.name] && setting?.unit
                ? setting.unit
                : ""}
            </span>
          </div>
        );
    }
  };

  const settingsGroups = [
    { title: "Voltage Settings", settings: voltageSettings },
    {
      title: "Harmonic Distortion Settings",
      settings: harmonicDistortionSettings,
    },
    { title: "Compensation Settings", settings: compensationSettings },
    { title: "Error Handling", settings: errorHandlingSettings },
    {
      title: "Fan and Hysteresis Settings",
      settings: fanAndHysteresisSettings,
    },
    {
      title: "Factory and Energy Settings",
      settings: factoryAndEnergySettings,
    },
  ];

  return (
    <div className="flex flex-col border border-gray-200 rounded-lg ">
      {[0, 5].map((startIdx) => (
        <div
          key={startIdx}
          className="flex-1 bg-white p-2 rounded-lg "
        >
          {settingsGroups?.slice(startIdx, startIdx + 5).map((group, idx) => (
            <div key={group?.title} className="mb-4">
              <h3
                className={`text-xs 3xl:text-sm font-medium text-gray-900 border-b border-gray-300 pb-2 mb-2 ${idx !== 0 ? "pt-2" : ""
                  }`}
              >
                {group?.title}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {group?.settings.map(renderField)}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Level2Settings;
