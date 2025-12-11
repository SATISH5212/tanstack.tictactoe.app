export type ApfcDevice = {
  id: number;
  device_name: string;
  device_serial_number: string;
  device_alias_name: string;
  status: "ACTIVE" | "INACTIVE";
  last_active_at: string;
  user_id: number | null;
  location_name: string;
  user_full_name: string | null;
  user_email: string | null;
  average_pf: number;
  average_voltage_ln: number;
  average_voltage_ll: number;
  average_current: number;
  total_kw: number;
  hp: number;
  total_kva: number;
  total_kvar: number;
  kwh: number;
  temperature: number;
  no_voltage_error: number;
  thd_i_error: number;
  temperature_error: number;
  over_voltage_error: number;
  under_voltage_error: number;
  over_compensate_error: number;
  under_compensate_error: number;
  ct_error: number;
  created_at: string;
  updated_at: string;
};

export interface User {
  id: number;
  full_name: string;
}

export interface DevicePayload {
  device_name: string;
  device_serial_number: string;
  location_id: number | null;
  user_id?: number | null;
}

export interface AddApfcDeviceProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit?: boolean;
  deviceData?: any;
  onResetEdit?: (isEdit: boolean) => void;
  refetchDevices?: () => void;
}