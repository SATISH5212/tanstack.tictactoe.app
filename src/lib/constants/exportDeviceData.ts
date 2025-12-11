import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

interface DeviceData {
  id?: number;
  title?: string;
  starter_number?: string | null;
  mcu_serial_no?: string | null;
  status?: string;
  ipv6?: string;
  gateway_connected?: string;
  mac_address?: string;
  current_gateway_id?: number | null;
  pcb_number?: string;
  motor_count?: number;
  fault_count?: number;
  alert_count?: number;
  starterBoxParameters?: {
    id?: number;
    motor_ref_id?: string;
    current_i1?: number;
    current_i2?: number;
    current_i3?: number;
    line_voltage_vry?: number;
    line_voltage_vyb?: number;
    line_voltage_vbr?: number;
    motor_state?: number;
    motor_mode?: string;
    time_stamp?: string;
    power_present?: string;
  }[];
}

const escapeCsvField = (field: any): string => {
  if (field === null || field === undefined) return "--";
  const str = String(field);
  return str.includes(",") || str.includes('"') || str.includes("\n")
    ? `"${str.replace(/"/g, '""')}"`
    : str;
};

export const exportDataInConvertToCSV = (data: DeviceData[]) => {
  const header = [
    "S.No",
    "Device Title",
    "PCB No",
    "MAC Address",
    "Power",
    "Status",
    "Voltages",
    "Currents",
    "Motor Modes",
    "Motor States",
    "Alerts",
    "Faults",
    "Time Stamp",
  ];

  const escapeCsvField = (value: any): string => {
    if (value == null) return "N/A";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  if (data.length === 0) {
    return `${header.join(",")}\n`;
  }

  const rows: any[] = [];
  data.forEach((item) => {
    const starterBoxParams = item?.starterBoxParameters || [];
    const motor1Params = starterBoxParams.filter(
      (param: any) => param.motor_ref_id === "mtr_1"
    );
    const motor2Params = starterBoxParams.filter(
      (param: any) => param.motor_ref_id === "mtr_2"
    );

    const maxLength = Math.max(motor1Params.length, motor2Params.length);

    if (maxLength === 0) {
      const row = [
        rows.length + 1 || 1,
        escapeCsvField(item?.title),
        escapeCsvField(item?.pcb_number),
        escapeCsvField(item?.mac_address),
        escapeCsvField("N/A"),
        escapeCsvField("ACTIVE"),
        escapeCsvField("N/A"),
        escapeCsvField("N/A"),
        escapeCsvField("N/A"),
        escapeCsvField("N/A"),
        escapeCsvField(item?.alert_count ?? 0),
        escapeCsvField(item?.fault_count ?? 0),
        escapeCsvField("N/A"),
      ];
      rows.push(row);

      return;
    }

    for (let i = 0; i < maxLength; i++) {
      const m1Params = motor1Params[i] || {};
      const m2Params = motor2Params[i] || {};

      const starterParams =
        Object.keys(m1Params).length > 0 ? m1Params : m2Params;

      const formattedDate = starterParams.time_stamp
        ? dayjs
          .utc(starterParams.time_stamp)
          .add(5, "hour")
          .add(30, "minute")
          .format("DD-MM-YYYY hh:mm A")
        : "N/A";

      const lineVoltages =
        starterParams.line_voltage_vry != null
          ? `${starterParams.line_voltage_vry} ${starterParams.line_voltage_vyb ?? "N/A"} ${starterParams.line_voltage_vbr ?? "N/A"}`
          : "N/A";

      const motorCurrents =
        [
          m1Params.current_i1 != null
            ? `M1: ${m1Params.current_i1} ${m1Params.current_i2 ?? 0} ${m1Params.current_i3 ?? 0}`
            : null,
          m2Params.current_i1 != null
            ? `M2: ${m2Params.current_i1} ${m2Params.current_i2 ?? 0} ${m2Params.current_i3 ?? 0}`
            : null,
        ]
          .filter(Boolean)
          .join("; ") || "N/A";

      const powerPresent =
        starterParams.power_present === "1"
          ? "ON"
          : starterParams.power_present != null
            ? "OFF"
            : "N/A";

      const motorModes =
        [
          m1Params.motor_mode != null ? `M1: ${m1Params.motor_mode}` : null,
          m2Params.motor_mode != null ? `M2: ${m2Params.motor_mode}` : null,
        ]
          .filter(Boolean)
          .join("; ") || "N/A";

      const motorStates =
        [
          m1Params.motor_state != null ? `M1: ${m1Params.motor_state}` : null,
          m2Params.motor_state != null ? `M2: ${m2Params.motor_state}` : null,
        ]
          .filter(Boolean)
          .join("; ") || "N/A";

      const row = [
        rows.length + 1 || 1,
        escapeCsvField(item?.title),
        escapeCsvField(item?.pcb_number),
        escapeCsvField(item?.mac_address),
        escapeCsvField(powerPresent),
        escapeCsvField("ACTIVE"),
        escapeCsvField(lineVoltages),
        escapeCsvField(motorCurrents),
        escapeCsvField(motorModes),
        escapeCsvField(motorStates),
        escapeCsvField(item?.alert_count ?? 0),
        escapeCsvField(item?.fault_count ?? 0),
        escapeCsvField(formattedDate),
      ];
      rows.push(row);
    }
  });

  const csvContent = [
    header.join(","),
    ...rows.map((row: any) => row.join(",")),
  ].join("\n");

  return csvContent;
};
export const downloadCSV = (data: string, fileName: string) => {
  if (!window.Blob || !window.URL) {
    throw new Error("Browser does not support Blob or URL APIs");
  }

  const sanitizeFileName = (name: string) => {
    return name.replace(/[^a-zA-Z0-9-_]/g, "_");
  };

  const csvData = new Blob([data], { type: "text/csv;charset=utf-8;" });
  const csvURL = URL.createObjectURL(csvData);
  const link = document.createElement("a");
  link.href = csvURL;
  link.download = `${sanitizeFileName(fileName)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(csvURL);
};
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