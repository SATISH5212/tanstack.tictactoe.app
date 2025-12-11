import React, { useState } from "react";
import { Switch } from "src/components/ui/switch";
import { Label } from "src/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import RangeWithUnits from "src/components/core/RangeWithUnits";
import PasswordFormFields from "../PasswordFormFeidls"; // Note: Fix typo in import (Feidls → Fields)
import {
  compensationSettings,
  errorHandlingSettings,
  factoryAndEnergySettings,
  fanAndHysteresisSettings,
  harmonicDistortionSettings,
  voltageSettings,
} from "src/lib/constants/apfcSettingsConstants";
import SaveAndConfirmationButtons from "./SaveAndConfirmationButtons";
import { Input } from "src/components/ui/input";
import PasswordInput from "src/components/core/PasswordInput";

const Level2Component = ({ levelBasedData, isLoading, refetchData }: any) => {
  const [errorMessages, setErrorMessages] = useState<any>({});
  const [formData, setFormData] = useState<any>(levelBasedData || {});
  const queryClient = useQueryClient();

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { name: string; value: any; type: any } }
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessages((prev: any) => ({ ...prev, [name]: "" }));
  };
  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: checked ? "ON" : "OFF",
    }));
    setErrorMessages((prev: any) => ({ ...prev, [name]: "" }));
  };

  const renderField = (setting: any) => {
    switch (setting.type) {
      case "switch":
        return (
          <div key={setting.name} className="flex items-center space-x-2 mb-4">
            <Label
              htmlFor={setting.name}
              className="text-xs 3xl:text-sm text-black"
            >
              {setting.label}
            </Label>
            <Switch
              id={setting.name}
              name={setting.name}
              checked={formData[setting.name] === "ON"}
              onCheckedChange={(checked) =>
                handleSwitchChange(setting.name, checked)
              }
              className="scale-75 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
            />
          </div>
        );
      case "input":
        if (setting.unit) {
          return (
            <RangeWithUnits
              key={setting.name}
              setting={setting}
              value={formData}
              onChange={handleChange}
              disabled={isLoading}
            />
          );
        }
        return (
          <div key={setting.name} className="space-y-1">
            <Label
              htmlFor={setting?.name}
              className="text-xs 3xl:text-sm text-gray-600"
            >
              {setting?.label}
            </Label>
            <Input
              id={setting?.name}
              name={setting?.name}
              value={formData[setting?.name] ?? ""}
              onChange={handleChange}
              className="h-8 w-1/4 rounded-md border-gray-300 text-sm"
            />
          </div>
        );
      case "password":
        return (
          <div key={setting.name} className="mb-4">
            <PasswordInput
              name={setting?.name}
              value={formData[setting?.name] || ""}
              onChange={handleChange}
              label={setting?.label}
            // disabled={isLoading}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto w-full mt-4">
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <section className="flex-1 rounded-lg bg-white p-2 border">
            <h3 className="border-b border-gray-200 px-2 pb-2 text-smd 3xl:text-base font-medium text-black">
              Voltage Settings
            </h3>
            <div className="mb-3 space-y-4 p-2">
              {voltageSettings.map(renderField)}
            </div>
            <h3 className="border-b border-gray-200 px-2 pb-2 text-smd 3xl:text-base font-medium text-black">
              Harmonic Distortion Settings
            </h3>
            <div className="mb-3 space-y-4 p-2">
              {harmonicDistortionSettings.map(renderField)}
            </div>
            <h3 className="border-b border-gray-200 px-2 pb-2 text-smd 3xl:text-base font-medium text-black">
              Compensation Settings
            </h3>
            <div className="mb-3 space-y-4 p-2">
              {compensationSettings.map(renderField)}
            </div>
          </section>

          <section className="flex-1 rounded-lg bg-white p-2 border">
            <h3 className="border-b border-gray-200 px-2 pb-2 text-smd 3xl:text-base font-medium text-black">
              Error Handling Settings
            </h3>
            <div className="mb-3 space-y-4 p-2">
              {errorHandlingSettings.map(renderField)}
            </div>
            <h3 className="border-b border-gray-200 px-2 pb-2 text-smd 3xl:text-base font-medium text-black">
              Fan and Hysteresis Settings
            </h3>
            <div className="mb-3 space-y-4 p-2">
              {fanAndHysteresisSettings.map(renderField)}
            </div>
          </section>
          <section className="flex-1 rounded-lg bg-white p-2 border">
            <h3 className="border-b border-gray-200 px-2 pb-2 text-smd 3xl:text-base font-medium text-black">
              Factory and Energy Settings
            </h3>
            <div className="mb-3 space-y-4 p-2">
              {factoryAndEnergySettings.map(renderField)}
            </div>
          </section>
        </div>
        <SaveAndConfirmationButtons
          formData={formData}
          refetchData={refetchData}
          setErrorMessages={setErrorMessages}
        />
      </div>
    </div>
  );
};

export default Level2Component;
