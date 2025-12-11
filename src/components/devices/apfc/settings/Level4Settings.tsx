// Level4Settings.tsx

import { fanSettings } from "src/lib/constants/apfcSettingsConstants";
import PasswordFormFields from "./PasswordFormFeidls";
import FanSettingsRadieterImg from "src/components/icons/apfc/FanSettings";
import FanTemparatureImg from "src/components/icons/apfc/FanTemparature";

interface Level4SettingsProps {
  levelBasedData: Record<string, any>;
}

const Level4Settings = ({ levelBasedData }: Level4SettingsProps) => {
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
          <div key={setting.name} className="flex items-center p-2">
            {levelBasedData[setting?.name] === "ON" ||
              levelBasedData[setting?.name] === "OFF" ? (
              <span
                className={`text-xs 3xl:text-smd 3xl:text-base flex items-center gap-2 ${levelBasedData[setting?.name] === "ON"
                    ? "text-green-500"
                    : "text-orange-500"
                  }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${levelBasedData[setting?.name] === "ON"
                      ? "bg-green-500"
                      : "bg-orange-500"
                    }`}
                />
                {levelBasedData[setting?.name] || "--"}
              </span>
            ) : (
              <>
                {setting?.name === "temperature" ? (
                  <div className="flex items-center gap-2">
                    <FanTemparatureImg className="size-8" />
                    <span className="text-xs 3xl:text-smd 3xl:text-base text-gray-800">
                      {levelBasedData[setting?.name]
                        ? `${levelBasedData[setting?.name]} °C`
                        : "--"}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs 3xl:text-smd 3xl:text-base text-gray-800">
                    {levelBasedData[setting?.name] || "--"}
                  </span>
                )}
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1 bg-white p-2 rounded-lg border border-gray-200">
        <div className="">
          <h3 className="text-xs 3xl:text-smd 3xl:text-base font-medium text-gray-900 border-b border-gray-300 pb-2 mb-2">
            Fan Settings
          </h3>
          <div className="flex items-center gap-4 p-2">
            <div className="flex flex-wrap gap-4 items-center">
              <FanSettingsRadieterImg className="size-10" />
              {fanSettings?.map(renderField)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Level4Settings;
