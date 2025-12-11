export interface FormField {
  label: string;
  type: string;
  options?: string[];
  min?: number;
  max?: number;
  name: string;
}

export const AuthenticationSettings = [
  { label: "Password", type: "password", name: "password" },
  { label: "Confirm Password", type: "password", name: "confirm_password" },
];

export const DeviceConfiguration = [
  // { label: "Level Indication", type: "text", name: "level_indication" },
  {
    label: "Network Selection",
    type: "select",
    options: ["3P4W", "1P2W"],
    name: "network_selection",
  },
];
export const CurrentTransformerSettings = [
  {
    label: "CT Secondary",
    type: "select",
    options: ["5A", "10A"],
    name: "ct_secondary",
    unit: "",
  },
  {
    label: "CT Primary",
    type: "number",
    min: 1,
    max: 100,
    name: "ct_primary",
    unit: "A",
  },
];
export const PotentialTransformerSettings = [
  { label: "PT Secondary", type: "number", name: "pt_secondary", unit: "V" },
  { label: "PT Primary", type: "number", name: "pt_primary", unit: "V" },
];
export const CompensationSettings = [
  {
    label: "Phase Compensation Angle",
    type: "number",
    name: "phase_compensation_angel",
  },
  { label: "Nominal Voltage", type: "text", name: "nominal_voltage" },
  {
    label: "Threshold Voltage",
    type: "number",
    name: "threshold_voltage",
    unit: "%",
  },
  {
    label: "Auto Initialization",
    type: "radio",
    options: [
      { label: "Yes", value: "YES" },
      { label: "No", value: "NO" },
    ],
    name: "auto_initialization",
  },
  { label: "Relays Count", type: "number", name: "relays_count" },
  {
    label: "Control Mode",
    type: "radio",
    options: [
      { label: "Auto", value: "AUTO" },
      { label: "Manual", value: "MANUAL" },
    ],
    name: "control_mode",
  },
  {
    label: "Switching program",
    type: "radio",
    options: [
      { label: "Auto", value: "AUTO" },
      { label: "Linear", value: "LINEAR" },
      { label: "Rational", value: "RATIONAL" },
    ],
    name: "switching_program",
  },
  { label: "Target Power Factor", type: "number", name: "target_pf" },
];
export const TimingSettings = [
  { label: "Step Time", type: "number", name: "step_time", unit: "S" },
  {
    label: "Discharge Time(Reconnection Time)",
    type: "number",
    name: "discharging_time",
    unit: "S",
  },
];
export const ControlSensitivitySettings = [
  {
    label: "Control Sensitivity",
    type: "number",
    name: "control_sensitivity",
    unit: "%",
  },
  { label: "Low Current", type: "number", name: "low_current", unit: "%" },
];
export const CommunicationSettings = [
  { label: "Slave ID", type: "text", name: "slave_id" },
  {
    label: "Baud Rate",
    type: "select",
    options: ["9600", "14400", "19200"],
    name: "baud_rate",
  },
  {
    label: "Parity",
    type: "radio",
    options: [
      { label: "None", value: "NONE" },
      { label: "Odd", value: "ODD" },
      { label: "Even", value: "EVEN" },
    ],
    name: "parity",
  },
  {
    label: "Stop Bits",
    type: "radio",
    options: [
      { label: "1", value: "1" },
      { label: "2", value: "2" },
    ],
    name: "stop_bits",
  },
];
export const DisplaySettings = [
  { label: "Back Light", type: "number", name: "back_light", unit: "S" },
];
export const FrequencySettings = [
  {
    label: "Frequency",
    type: "number",
    name: "sync_frequency",
    unit: "",
    min: 1,
    max: 10,
  },
];

export type Setting = {
  name: string;
  label: string;
  type: "switch" | "input" | "select" | "password";
  options?: string[];
  min?: number;
  max?: number;
  unit?: string;
  step?: number;
};

export const voltageSettings: Setting[] = [
  { name: "trip_time", label: "Trip Time", type: "switch" },
  { name: "no_volt", label: "No Volt", type: "switch" },
  { name: "over_volt", label: "Over Volt", type: "switch" },
  {
    name: "set_min_over_volt",
    label: "Set Over Voltage Min",
    type: "input",
    min: 0,
    max: 1000,
    unit: "V",
  },
  {
    name: "set_max_over_volt",
    label: "Set Over Voltage Max",
    type: "input",
    min: 0,
    max: 1000,
    unit: "V",
  },
  { name: "under_volt", label: "Under Volt", type: "switch" },
];

export const harmonicDistortionSettings: Setting[] = [
  {
    name: "total_harmonic_distortion",
    label: "Total Harmonic Distortion",
    type: "switch",
  },
  {
    name: "thd_i_range",
    label: "THD I Range",
    type: "input",
    min: 0,
    max: 100,
    unit: "%",
  },
];

export const compensationSettings: Setting[] = [
  { name: "over_compensate", label: "Over Compensate", type: "switch" },
  { name: "under_compensate", label: "Under Compensate", type: "switch" },
];

export const errorHandlingSettings: Setting[] = [
  { name: "step_error", label: "Step Error", type: "switch" },
  {
    name: "step_error_setting",
    label: "Step Error Setting",
    type: "input",
    min: 0,
    max: 100,
    unit: "%",
  },
  { name: "ct_polarity_error", label: "CT Poliarity error", type: "switch" },
  { name: "over_temperature", label: "Over Temperature", type: "switch" },
  {
    name: "over_temperature_setting",
    label: "Over Temperature Setting",
    type: "input",
    min: 0,
    max: 100,
    unit: "C",
  },
];

export const fanAndHysteresisSettings: Setting[] = [
  { name: "fan_setting", label: "Fan Setting", type: "switch" },
  {
    name: "histeresis_voltage",
    label: "Hysteresis Voltage",
    type: "input",
    min: 0,
    max: 100,
    unit: "%",
  },
  {
    name: "histeresis_pf",
    label: "Hysteresis PF",
    type: "input",
    min: 0,
    max: 100,
    unit: "%",
  },
];

export const factoryAndEnergySettings: Setting[] = [
  { name: "factory_default", label: "Factory Default", type: "switch" },
  { name: "reset_energy", label: "Reset Energy", type: "switch" },

  { name: "reset_kwh", label: "Reset kWh", type: "switch" },
  { name: "reset_kvah", label: "Reset kVAh", type: "switch" },
  { name: "reset_kvarh", label: "Reset kVARh", type: "switch" },
  {
    name: "reset_energy_password",
    label: "Reset Energy Password",
    type: "password",
  },
];

export const factoryEnergySettings: any = [
  ...Array.from({ length: 12 }, (_, i) => ({
    label: `RLY${i + 1}`,
    type: "switch",
    name: `relay${i + 1}`,
  })),
];
export const fanSettings: any = [
  {
    name: "set_status",
    type: "select",
    options: ["NONE", "Fixed ON", "Temperature On", "Temperature Off"],
  },
  { name: "temperature", label: "Temperature", type: "number", unit: "c" },
];
export const steppersConstansts = [
  { title: "Level 1", sub_title: "Short step description", label: "Level1" },
  { title: "Level 2", sub_title: "Short step description", label: "Level2" },
  { title: "Level 3", sub_title: "Short step description", label: "Level3" },
  {
    title: "Fan Settings",
    sub_title: "Short step description",
    label: "Level4",
  },
];

export const parametersForChart = [
  {
    value: "total_kw",
    title: "Total kW",
    color: "#8884d8",
  },
  {
    value: "average_pf",
    title: "Average PF",
    color: "#82ca9d",
  },
  {
    value: "kwh",
    title: "kWh",
    color: "#ffc658",
  },
  {
    value: "kvah",
    title: "kVAh",
    color: "#ff7300",
  },
];
export const parameters = [
  { value: "total_kw", title: "Total kW", color: "#8884D8" },
  { value: "average_pf", title: "Average PF", color: "#82CA9D" },
  { value: "kwh", title: "kWh", color: "#FFC658" },
  { value: "kvah", title: "kVAh", color: "#FF7300" },
  {
    value: "average_voltage_ll",
    title: "Average voltage LL",
    color: "#92298F",
  },
  { value: "average_current", title: "Average current", color: "#FF00FF" },
];
