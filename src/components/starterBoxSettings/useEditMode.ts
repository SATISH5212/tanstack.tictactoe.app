import { useState, useCallback, useMemo, useEffect } from "react";
import {
  DeviceSettings,
  DeviceSettingsData,
  ExtendedDeviceSettings,
  MotorSettings,
} from "src/lib/interfaces/core/settings";
import { calculateFlc } from "src/lib/helpers/deviceSettings";

const DEFAULT_MOTOR_LIMITS = [{}, {}];

export const useEditMode = (deviceSettingsData: DeviceSettingsData | null) => {
  const [editMode, setEditMode] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [editedSettings, setEditedSettings] = useState<Partial<DeviceSettings>>(
    deviceSettingsData ?? {}
  );

  useEffect(() => {
    if (deviceSettingsData) {
      setEditedSettings(deviceSettingsData);
    } else {
      setEditedSettings({});
    }
  }, [deviceSettingsData]);

  const motorData = useMemo(() => {
    const m1 =
      editedSettings.motor_specific_limits?.[0] ||
      deviceSettingsData?.motor_specific_limits?.[0] ||
      {};
    const m2 =
      editedSettings.motor_specific_limits?.[1] ||
      deviceSettingsData?.motor_specific_limits?.[1] ||
      {};
    const m1Hp = deviceSettingsData?.motor_specific_limits?.[0]?.hp || 1;
    const m2Hp = deviceSettingsData?.motor_specific_limits?.[1]?.hp || 1;
    const m1FlcEdited = parseFloat(m1.full_load_current?.toString() || "0");
    const m2FlcEdited = parseFloat(m2.full_load_current?.toString() || "0");

    return {
      m1,
      m2,
      m1Flc: calculateFlc(m1Hp, m1FlcEdited),
      m2Flc: calculateFlc(m2Hp, m2FlcEdited),
    };
  }, [editedSettings.motor_specific_limits, deviceSettingsData]);

  // Value getters
  const getCurrentValue = useCallback(
    (key: keyof DeviceSettings) => {
      return editedSettings[key] ?? deviceSettingsData?.[key] ?? "-";
    },
    [editedSettings, deviceSettingsData]
  );

  const getMotorValue = useCallback(
    (motorIndex: number, key: keyof MotorSettings) => {
      const motorLimits = editedSettings.motor_specific_limits
        ? editedSettings.motor_specific_limits[motorIndex]
        : deviceSettingsData?.motor_specific_limits?.[motorIndex];
      return motorLimits?.[key] ?? "-";
    },
    [editedSettings, deviceSettingsData]
  );

  // Handlers
  const handleDoubleClick = useCallback((field: string) => {
    setEditMode(true);
    setFocusedField(field);
  }, []);

  const handleInputChange = useCallback(
    (key: keyof ExtendedDeviceSettings, value: string | number) => {
      setEditedSettings((prev) => ({
        ...prev,
        [key]:
          key === "flt_en"
            ? typeof value === "number"
              ? value
              : parseInt(value, 10)
            : typeof value === "string" && !isNaN(parseFloat(value))
              ? parseFloat(value)
              : value,
      }));
    },
    []
  );

  const handleMotorInputChange = useCallback(
    (motorIndex: number, key: keyof MotorSettings, value: string) => {
      const numValue = parseFloat(value);
      const newValue = isNaN(numValue) ? value : numValue;
      setEditedSettings((prev) => {
        const motorLimits = [
          ...(prev.motor_specific_limits || DEFAULT_MOTOR_LIMITS),
        ];
        motorLimits[motorIndex] = {
          ...motorLimits[motorIndex],
          [key]: newValue,
        };
        return { ...prev, motor_specific_limits: motorLimits };
      });
    },
    []
  );

  const handleCancel = useCallback(() => {
    setEditedSettings(deviceSettingsData ?? {});
    setEditMode(false);
    setFocusedField(null);
  }, [deviceSettingsData]);

  return {
    editMode,
    setEditMode,
    focusedField,
    setFocusedField,
    editedSettings,
    setEditedSettings,
    motorData,
    getCurrentValue,
    getMotorValue,
    handleDoubleClick,
    handleInputChange,
    handleMotorInputChange,
    handleCancel,
  };
};
