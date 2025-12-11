import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";

import { fanSettings } from "src/lib/constants/apfcSettingsConstants";
import SaveAndConfirmationButtons from "./SaveAndConfirmationButtons";
import FanSettingsRadieterImg from "src/components/icons/apfc/FanSettings";
import FanTemparatureImg from "src/components/icons/apfc/FanTemparature";
import RangeWithUnits from "src/components/core/RangeWithUnits";

interface Level4SettingsProps {
  levelBasedData: any;
  isLoading: boolean;
  refetchData: () => void;
}

const Level4Component = ({
  levelBasedData,
  isLoading,
  refetchData,
}: Level4SettingsProps) => {
  const [formData, setFormData] = useState(levelBasedData || {});
  const [errorMessages, setErrorMessages] = useState<any>({});

  // Updated handleChange to handle both direct value updates (Select) and event-based updates (Input)
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { name: string; value: any } }
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessages((prev: any) => ({ ...prev, [name]: "" }));
  };

  const renderField = (setting: any) => {
    switch (setting.type) {
      case "select":
        return (
          <div key={setting.name} className="flex flex-col gap-1 py-2">
            {setting.label && (
              <label className="text-xs 3xl:text-sm font-medium text-gray-700">
                {setting.label}
              </label>
            )}
            <Select
              onValueChange={(value) =>
                handleChange({
                  target: { name: setting.name, value },
                })
              }
              value={formData[setting.name] || "NONE"}
            >
              <SelectTrigger className="w-44 border-gray-300">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {setting.options?.map((option: any) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "number":
        return (
          <div key={setting.name} className="flex flex-col gap-1 py-2">
            {formData["set_status"] === "Temperature On" && (
              <>
                <RangeWithUnits
                  setting={setting}
                  value={formData}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </>
            )}
          </div>
        );
      default:
        return (
          <div key={setting.name} className="flex items-center gap-2 py-2">
            {setting.name === "temperature" ? (
              <div className="flex items-center gap-2">
                <FanTemparatureImg className="h-10 w-10" />
                <span className="text-sm text-gray-700">
                  {formData[setting.name]
                    ? `${formData[setting.name]} °C`
                    : "--"}
                </span>
              </div>
            ) : (
              <span
                className={`text-sm font-medium ${formData[setting.name] === "ON"
                    ? "text-green-600"
                    : formData[setting.name] === "OFF"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
              >
                {formData[setting.name] || "--"}
              </span>
            )}
          </div>
        );
    }
  };

  return (
    <div className="mx-auto w-full  mt-4">

      <form className="w-full space-y-4">
        <section className="rounded-lg bg-white p-2 shadow-sm max-w-md">
          <h3 className="border-b border-gray-200 px-2 pb-2 text-smd 3xl:text-base font-medium text-black">
            Fan Settings
          </h3>
          <div className="flex items-start gap-4 p-2">
            <FanSettingsRadieterImg />
            <div className="space-y-2">{fanSettings.map(renderField)}</div>
          </div>
        </section>
        <div className="flex justify-end gap-2">
          <SaveAndConfirmationButtons
            formData={formData}
            refetchData={refetchData}
            setErrorMessages={setErrorMessages}
          />
        </div>
      </form>

    </div>
  );
};

export default Level4Component;
