import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);



export const activeConstants = [
  {
    value: "ACTIVE",
    label: "Active",
  },
  {
    value: "INACTIVE",
    label: "Inactive",
  },
];



export const userTypeConstants = [
  {
    value: "SUPER_ADMIN",
    label: "Super Admin",
  },
  {
    value: "OWNER",
    label: "Owner",
  },
  {
    value: "MANAGER",
    label: "Manager",
  },
  {
    value: "SUPERVISOR",
    label: "Supervisor",
  },
  {
    value: "USER",
    label: "User",
  },
  {
    value: "ADMIN",
    label: "Admin",
  }
];
export type DeviceStatus = "ALL" | "ACTIVE" | "INACTIVE";
export type DevicePower = "ON" | "OFF" | "ALL"

export const DEVICE_POWER: Array<{ value: DevicePower; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "ON", label: "On" },
  { value: "OFF", label: "Off" },
];

export const DEVICE_STATUSES: Array<{ value: DeviceStatus; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export const statusConstants = [
  {
    value: "READY",
    label: "Ready",
  },
  {
    value: "TEST",
    label: "Testing",
  },
  {
    value: "DEPLOYED",
    label: "Deployed",
  },
  {
    value: "ASSIGNED",
    label: "Assigned",
  },
];
export const userTypeeConstants = [
  {
    value: "MANAGER",
    label: "Manager",
  },
  {
    value: "SUPERVISOR",
    label: "Supervisor",
  }

]
export const powerConstants = [
  {
    value: "ON",
    label: " On",
  },
  {
    value: "OFF",
    label: "Off",
  },
];
export const filterOptions = [
  { value: "device_status", label: "Device Status" },
  { value: "power_status", label: "Power Status" },
  { value: "deployment_status", label: "Deployment Status" },
];
export const statusOptions = {
  device_status: [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
  ],
  power_status: [
    { value: "ON", label: "On" },
    { value: "OFF", label: "Off" },
  ],
  deployment_status: [
    { value: "ASSIGNED", label: "Assigned" },
    { value: "READY", label: "Ready" },
    { value: "TEST", label: "Testing" },
    { value: "DEPLOYED", label: "Deployed" },
  ],
};

export const baseFields = [
  { key: "full_name", label: "Full Name" },
  { key: "status", label: "Status" },
  { key: "email", label: "Email " },
  { key: "phone", label: "Phone" },
  { key: "user_type", label: "User Type" },
  {
    key: "address",
    label: "Address",
  },
];
export const profileFields = () => {
  return [...baseFields];
};

export const statusLabelMap: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export const userTypeLabelMap: Record<string, string> = {
  OWNER: "Owner",
  SUPER_ADMIN: "Super Admin",
  MANAGER: "Manager",
  SUPERVISOR: "Supervisor",
  USER: "User",
  ADMIN: "Admin",
};



export const DEVICE_SETTINGS_FIELDS = [
  { label: "Phase Failure", alert: "phase_failure_alert", fault: "input_phase_failure", unit: "A" },
  { label: "Low Voltage", alert: "low_voltage_alert", fault: "low_voltage_fault", recovery: "low_voltage_recovery", unit: "V" },
  { label: "High Voltage", alert: "high_voltage_alert", fault: "high_voltage_fault", recovery: "high_voltage_recovery", unit: "V" },
  { label: "Voltage Imbalance", alert: "voltage_imbalance_alert", fault: "voltage_imbalance_fault", unit: "%" },
  { label: "Minimum Phase Angle", alert: "min_phase_angle_alert", fault: "min_phase_angle_fault", unit: "°" },
  { label: "Maximum Phase Angle", alert: "max_phase_angle_alert", fault: "max_phase_angle_fault" },
  { label: "Over Temperature", alert: "over_temperature_alert", fault: "over_temperature_fault", unit: "°C" },
  { label: "Dry Run Protection", alert: "dry_run_protection_alert", fault: "dry_run_protection_fault", unit: "%" },
  { label: "Over Load", alert: "over_load_alert", fault: "over_load_fault", recovery: "over_load_recovery", unit: "%" },
  { label: "Locked Rotor", alert: "locked_router_alert", fault: "locked_router_fault", recovery: "locked_router_recovery", unit: "%" },
  { label: "Current Imbalance", alert: "current_imbalance_alert", fault: "current_imbalance_fault", recovery: "current_imbalance_recovery", unit: "%" },
  { label: "Output Phase Failure", fault: "output_phase_failure" },
];

export const CALIBRATION_FIELDS = [
  { label: "U Gain R", field: "u_gain_r" },
  { label: "U Gain Y", field: "u_gain_y" },
  { label: "U Gain B", field: "u_gain_b" },
  { label: "I Gain R", field: "i_gain_r" },
  { label: "I Gain Y", field: "i_gain_y" },
  { label: "I Gain B", field: "i_gain_b" },
  { label: "Current Sense ADC Multiplication", field: "current_multiplier" },
];


export const allFields = [
  "u_gain_r", "u_gain_y", "u_gain_b", "i_gain_r", "i_gain_y", "i_gain_b",
  "current_multiplier", "input_phase_failure", "low_voltage_fault", "high_voltage_fault",
  "voltage_imbalance_fault", "min_phase_angle_fault", "max_phase_angle_fault",
  "over_temperature_fault", "dry_run_protection_fault", "over_load_fault",
  "locked_router_fault", "locked_router_recovery", "output_phase_failure",
  "current_imbalance_fault", "dry_run_protection_alert", "over_load_alert",
  "locked_router_alert", "current_imbalance_alert", "over_load_recovery",
  "current_imbalance_recovery", "full_load_current", "phase_failure_alert",
  "phase_failure_fault", "low_voltage_alert", "high_voltage_alert",
  "voltage_imbalance_alert", "min_phase_angle_alert", "max_phase_angle_alert",
  "over_temperature_alert", "low_voltage_recovery", "high_voltage_recovery",
  "seed_time", "start_timing_offset", "fault_detection", "hp"
];