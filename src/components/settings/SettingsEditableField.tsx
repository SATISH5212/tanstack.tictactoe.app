import React from "react";
import {
  DeviceSettings,
  DeviceSettingsLimits,
  MotorSettings,
} from "src/lib/interfaces/core/settings";
import { Input } from "../ui/input";

interface EditableFieldProps {
  value: any;
  field: string;
  isMotorField?: boolean;
  motorIndex?: number;
  motorKey?: keyof MotorSettings;
  editMode: boolean;
  focusedField: string | null;
  minMaxRangeData: DeviceSettingsLimits | null | undefined;
  onDoubleClick: (field: string) => void;
  onInputChange: (field: keyof DeviceSettings, value: string) => void;
  onMotorInputChange: (
    motorIndex: number,
    key: keyof MotorSettings,
    value: string
  ) => void;
  validateInput: (input: string | number, field: string) => boolean;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  value,
  field,
  isMotorField = false,
  motorIndex,
  motorKey,
  editMode,
  focusedField,
  minMaxRangeData,
  onDoubleClick,
  onInputChange,
  onMotorInputChange,
  validateInput,
}) => {
  const isValid = validateInput(value ?? "", field);

  if (!editMode) {
    return (
      <span
        onDoubleClick={() => onDoubleClick(field)}
        className="cursor-pointer"
      >
        {value ?? "-"}
      </span>
    );
  }

  return (
    <Input
      type="number"
      value={value ?? ""}
      onWheel={(e) => e.currentTarget.blur()}
      onChange={(e) => {
        const newValue = e.target.value;
        if (isMotorField && motorIndex !== undefined && motorKey) {
          onMotorInputChange(motorIndex, motorKey, newValue);
        } else {
          onInputChange(field as keyof DeviceSettings, newValue);
        }
      }}
      onBlur={() => {
        if (value !== "" && !isValid) {
          if (isMotorField && motorIndex !== undefined && motorKey) {
            onMotorInputChange(motorIndex, motorKey, value ?? "");
          } else {
            onInputChange(field as keyof DeviceSettings, value ?? "");
          }
        }
      }}
      className={`border outline-none ring-0 focus:ring-0 focus-visible:ring-0 rounded px-2 py-1 h-7 w-20 text-sm placeholder:text-xs ${
        !isValid && value !== "" ? "border-red-500" : "border-gray-300"
      }`}
      autoFocus={focusedField === field}
      step="0.1" // Allow decimal values
      placeholder="Enter value"
    />
  );
};
