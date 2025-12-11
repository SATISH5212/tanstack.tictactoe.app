// Level3Settings.tsx

import { factoryEnergySettings } from "src/lib/constants/apfcSettingsConstants";
import PasswordFormFields from "./PasswordFormFeidls";

interface Level3SettingsProps {
  levelBasedData: Record<string, any>;
}

const Level3Settings = ({ levelBasedData }: Level3SettingsProps) => {
  const renderField = (setting: any) => {
    switch (setting?.type) {
      case "password":
        return (
          <div key={setting.name} className="flex flex-col p-2">
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
            </span>
          </div>
        );
    }
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1 bg-white p-2 rounded-lg border border-gray-200 ">
        <div className="">
          <h3 className="text-xs 3xl:text-smd 3xl:text-base font-medium text-gray-900 border-b border-gray-300 pb-2 mb-2">
            Factory and Energy Settings
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {factoryEnergySettings?.map(renderField)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Level3Settings;
