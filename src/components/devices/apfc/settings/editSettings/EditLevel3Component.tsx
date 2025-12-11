import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Switch } from "src/components/ui/switch";
import { Button } from "src/components/ui/button";
import { factoryEnergySettings } from "src/lib/constants/apfcSettingsConstants";
import SaveAndConfirmationButtons from "./SaveAndConfirmationButtons";

interface Level3ComponentProps {
  levelBasedData: any;
  isLoading: boolean;
  refetchData: () => void;
}

const Level3Component = ({
  levelBasedData,
  isLoading,
  refetchData,
}: Level3ComponentProps) => {
  const [formData, setFormData] = useState(levelBasedData || {});
  const [errorMessages, setErrorMessages] = useState<any>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | boolean,
    name?: string
  ) => {
    if (typeof e === "boolean" && name) {
      setFormData({
        ...formData,
        [name]: e ? "ON" : "OFF",
      });
    } else if (e instanceof Object && "target" in e) {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const renderField = (setting: any) => {
    switch (setting.type) {
      case "switch":
        return (
          <div
            key={setting.name}
            className="flex items-center justify-between max-w-[200px] py-2"
          >
            <label className="text-xs 3xl:text-sm font-medium text-black">
              {setting.label} :
            </label>
            <Switch
              checked={formData[setting.name] === "ON"}
              onCheckedChange={(checked) => handleChange(checked, setting.name)}
              className="scale-75 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"

            />
          </div>
        );
      case "input":
        return (
          <div key={setting.name} className="flex flex-col gap-1 py-2">
            <label className="text-xs 3xl:text-sm font-normal text-gray-700">
              {setting.label}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name={setting.name}
                min={setting.min}
                max={setting.max}
                step={setting.step || 1}
                value={formData[setting.name] || ""}
                onChange={handleChange}
                className="w-full max-w-[150px] rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              {setting.unit && (
                <span className="text-sm text-gray-500">{setting.unit}</span>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto w-full  mt-4">

      <form className="w-full  space-y-4">
        <section className="rounded-lg bg-white p-2 shadow-sm max-w-md">
          <h3 className="border-b border-gray-200 px-2 pb-2 text-smd 3xl:text-base font-medium text-black">
            Factory and Energy Settings
          </h3>
          <div className="space-y-1">
            {factoryEnergySettings.map(renderField)}
          </div>
        </section>
        <SaveAndConfirmationButtons
          formData={formData}
          refetchData={refetchData}
          setErrorMessages={setErrorMessages}
        />
      </form>

    </div>
  );
};

export default Level3Component;
