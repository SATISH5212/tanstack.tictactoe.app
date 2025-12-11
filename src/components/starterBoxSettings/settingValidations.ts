import { toast } from "sonner";
import {
  DeviceSettings,
  DeviceSettingsLimits,
  MotorSettings,
} from "src/lib/interfaces/core/settings";

export const validateInput = (
  input: string | number,
  field: string,
  minMaxRangeData: DeviceSettingsLimits | null | undefined
): boolean => {
  if (input === "" || input == null) return true;
  const numValue = typeof input === "string" ? parseFloat(input) : input;

  if (isNaN(numValue)) {
    console.warn(`Invalid input for ${field}: Not a number`);
    toast.error(`Invalid input for ${field}: Please enter a valid number`);
    return false;
  }

  if (numValue < 0) {
    console.warn(`Negative values are not allowed for ${field}`);
    toast.error(`Negative values are not allowed for ${field}`);
    return false;
  }

  let fieldKey = field;
  if (field.startsWith("motor_")) {
    fieldKey = field.split("_").slice(2).join("_");
  }

  const minKey = `${fieldKey}_min` as keyof DeviceSettingsLimits;
  const maxKey = `${fieldKey}_max` as keyof DeviceSettingsLimits;
  const minValueRaw = minMaxRangeData?.[minKey];
  const maxValueRaw = minMaxRangeData?.[maxKey];

  let isValid = true;

  if (minValueRaw != null) {
    const minValue =
      typeof minValueRaw === "string" ? parseFloat(minValueRaw) : minValueRaw;
    if (isNaN(minValue)) {
      console.warn(`Invalid min value for ${fieldKey}`);
    } else if (numValue < minValue) {
      console.warn(
        `Value ${numValue} for ${fieldKey} is less than the minimum value [${minValue}]`
      );
      toast.error(`Value for ${fieldKey} must be at least ${minValue}`);
      isValid = false;
    }
  }

  if (maxValueRaw != null) {
    const maxValue =
      typeof maxValueRaw === "string" ? parseFloat(maxValueRaw) : maxValueRaw;
    if (isNaN(maxValue)) {
      console.warn(`Invalid max value for ${fieldKey}`);
    } else if (numValue > maxValue) {
      console.warn(
        `Value ${numValue} for ${fieldKey} is greater than the maximum value [${maxValue}]`
      );
      toast.error(`Value for ${fieldKey} cannot exceed ${maxValue}`);
      isValid = false;
    }
  }

  return isValid;
};

export const validateSettings = (
  settings: Partial<DeviceSettings>,
  minMaxRangeData: DeviceSettingsLimits | null | undefined
): { isValid: boolean; invalidFields: string[] } => {
  const invalidFields: string[] = [];

  const topLevelFields = [
    "phase_failure_alert",
    "low_voltage_alert",
    "low_voltage_fault",
    "low_voltage_recovery",
    "high_voltage_alert",
    "high_voltage_fault",
    "high_voltage_recovery",
    "voltage_imbalance_alert",
    "voltage_imbalance_fault",
    "min_phase_angle_alert",
    "min_phase_angle_fault",
    "max_phase_angle_alert",
    "max_phase_angle_fault",
    "over_temperature_alert",
    "over_temperature_fault",
    "input_phase_failure",
    "u_gain_r",
    "u_gain_y",
    "u_gain_b",
    "i_gain_r",
    "i_gain_y",
    "i_gain_b",
    "current_multiplier",
    "seed_time",
    "start_timing_offset",
    "flt_en",
  ];

  for (const field of topLevelFields) {
    const value = settings[field as keyof DeviceSettings];
    const minKey = `${field}_min` as keyof DeviceSettingsLimits;
    const maxKey = `${field}_max` as keyof DeviceSettingsLimits;
    const minValueRaw = minMaxRangeData?.[minKey];
    const maxValueRaw = minMaxRangeData?.[maxKey];

    if (minValueRaw == null || maxValueRaw == null) {
      continue;
    }
    const minValue =
      typeof minValueRaw === "string" ? parseFloat(minValueRaw) : minValueRaw;
    const maxValue =
      typeof maxValueRaw === "string" ? parseFloat(maxValueRaw) : maxValueRaw;

    if (isNaN(minValue) || isNaN(maxValue)) {
      continue;
    }

    if (value === undefined || Array.isArray(value)) {
      continue;
    }

    const numValue = typeof value === "string" ? parseFloat(value) : value;

    if (
      value !== "" &&
      (isNaN(numValue) || numValue < minValue || numValue > maxValue)
    ) {
      invalidFields.push(field);
    }
  }

  const motorFields = [
    "full_load_current",
    "dry_run_protection_alert",
    "dry_run_protection_fault",
    "over_load_alert",
    "over_load_fault",
    "over_load_recovery",
    "locked_router_alert",
    "locked_router_fault",
    "locked_router_recovery",
    "output_phase_failure",
    "current_imbalance_alert",
    "current_imbalance_fault",
    "current_imbalance_recovery",
  ];

  settings.motor_specific_limits?.forEach((motor, index) => {
    for (const field of motorFields) {
      const value = motor[field as keyof MotorSettings];
      const minKey = `${field}_min` as keyof DeviceSettingsLimits;
      const maxKey = `${field}_max` as keyof DeviceSettingsLimits;
      const minValueRaw = minMaxRangeData?.[minKey];
      const maxValueRaw = minMaxRangeData?.[maxKey];

      if (minValueRaw == null || maxValueRaw == null) {
        continue;
      }

      const minValue =
        typeof minValueRaw === "string" ? parseFloat(minValueRaw) : minValueRaw;
      const maxValue =
        typeof maxValueRaw === "string" ? parseFloat(maxValueRaw) : maxValueRaw;

      if (isNaN(minValue) || isNaN(maxValue)) {
        continue;
      }

      if (value === undefined) {
        continue;
      }

      const numValue = typeof value === "string" ? parseFloat(value) : value;

      if (
        value !== "" &&
        (isNaN(numValue) || numValue < minValue || numValue > maxValue)
      ) {
        invalidFields.push(`motor_${index + 1}.${field}`);
      }
    }
  });

  return {
    isValid: invalidFields.length === 0,
    invalidFields,
  };
};

