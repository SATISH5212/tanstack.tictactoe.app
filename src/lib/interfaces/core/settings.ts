import React, { Dispatch, MutableRefObject, SetStateAction } from "react";

export interface MotorSettings {
  hp?: number;
  dry_run_protection_fault?: number;
  over_load_fault?: number;
  locked_router_fault?: number;
  output_phase_failure?: number;
  current_imbalance_fault?: number;
  dry_run_protection_alert?: number;
  over_load_alert?: number;
  locked_router_alert?: number;
  current_imbalance_alert?: number;
  over_load_recovery?: number;
  locked_router_recovery?: number;
  current_imbalance_recovery?: number;
  motor_ref_id?: string;
  full_load_current?: number;
  motor_title?: string;
}

export interface DeviceSettingsData {
  capable_motors?: number;
  input_phase_failure?: number;
  low_voltage_fault?: number;
  high_voltage_fault?: number;
  voltage_imbalance_fault?: number;
  min_phase_angle_fault?: number;
  max_phase_angle_fault?: number;
  min_frequency_fault?: number;
  max_frequency_fault?: number;
  over_temperature_fault?: number;
  u_gain_r?: number;
  u_gain_y?: number;
  u_gain_b?: number;
  i_gain_r?: number;
  i_gain_y?: number;
  i_gain_b?: number;
  current_multiplier?: number;
  seed_time?: number;
  start_timing_offset?: number;
  phase_failure_alert?: number;
  low_voltage_alert?: number;
  high_voltage_alert?: number;
  voltage_imbalance_alert?: number;
  min_phase_angle_alert?: number;
  max_phase_angle_alert?: number;
  min_frequency_alert?: number;
  max_frequency_alert?: number;
  over_temperature_alert?: number;
  low_voltage_recovery?: number;
  high_voltage_recovery?: number;
  motor_specific_limits?: MotorSettings[];
  m1_hp?: number;
  m2_hp?: number;
  dr1f?: number;
  ol1f?: number;
  lr1f?: number;
  opf1f?: number;
  ci1f?: number;
  dr2f?: number;
  ol2f?: number;
  lr2f?: number;
  opf2f?: number;
  ci2f?: number;
  dr1a?: number;
  ol1a?: number;
  lr1a?: number;
  ci1a?: number;
  dr2a?: number;
  ol2a?: number;
  lr2a?: number;
  ci2a?: number;
  or1?: number;
  lr1r?: number;
  ci1r?: number;
  or2?: number;
  lr2r?: number;
  ci2r?: number;
  rValue?: number;
  motor_flc1?: number;
  motor_flc2?: number;
  is_new_configuration_saved: number;
  updated_at?: string;
  starterBox: {
    id: number;
    title: string;
    mac_address: string;
    pcb_number: string;
  };
  flt_en: any;
}
export interface DeviceSettings {
  // serial_number?: string;
  // device_ipv6?: string;
  input_phase_failure?: number;
  low_voltage_fault?: number;
  high_voltage_fault?: number;
  voltage_imbalance_fault?: number;
  min_phase_angle_fault?: number;
  max_phase_angle_fault?: number;
  min_frequency_fault?: number;
  max_frequency_fault?: number;
  over_temperature_fault?: number;
  u_gain_r?: number;
  u_gain_y?: number;
  u_gain_b?: number;
  i_gain_r?: number;
  i_gain_y?: number;
  i_gain_b?: number;
  current_multiplier?: number;
  seed_time?: number;
  start_timing_offset?: number;
  phase_failure_alert?: number;
  low_voltage_alert?: number;
  high_voltage_alert?: number;
  voltage_imbalance_alert?: number;
  min_phase_angle_alert?: number;
  max_phase_angle_alert?: number;
  min_frequency_alert?: number;
  max_frequency_alert?: number;
  over_temperature_alert?: number;
  low_voltage_recovery?: number;
  high_voltage_recovery?: number;
  motor_specific_limits?: MotorSettings[];
  m1_hp?: number;
  m2_hp?: number;
  dr1f?: number;
  ol1f?: number;
  lr1f?: number;
  opf1f?: number;
  ci1f?: number;
  dr2f?: number;
  ol2f?: number;
  lr2f?: number;
  opf2f?: number;
  ci2f?: number;
  dr1a?: number;
  ol1a?: number;
  lr1a?: number;
  ci1a?: number;
  dr2a?: number;
  ol2a?: number;
  lr2a?: number;
  ci2a?: number;
  or1?: number;
  lr1r?: number;
  ci1r?: number;
  or2?: number;
  lr2r?: number;
  ci2r?: number;
  rValue?: number;
  motor_flc1?: number;
  motor_flc2?: number;
  is_new_configuration_saved: number;
  updated_at?: string;
  flt_en?: number;
}
export interface DeviceSettingsLimits {
  id: number;
  starter_id: number;
  u_gain_r_min: number;
  u_gain_r_max: number;
  u_gain_y_min: number;
  u_gain_y_max: number;
  u_gain_b_min: number;
  u_gain_b_max: number;
  i_gain_r_min: number;
  i_gain_r_max: number;
  i_gain_y_min: number;
  i_gain_y_max: number;
  i_gain_b_min: number;
  i_gain_b_max: number;
  current_multiplier_min: number;
  current_multiplier_max: number;
  input_phase_failure_min: number;
  input_phase_failure_max: number;
  low_voltage_fault_min: number;
  low_voltage_fault_max: number;
  high_voltage_fault_min: number;
  high_voltage_fault_max: number;
  voltage_imbalance_fault_min: number;
  voltage_imbalance_fault_max: number;
  min_phase_angle_fault_min: number;
  min_phase_angle_fault_max: number;
  max_phase_angle_fault_min: number;
  max_phase_angle_fault_max: number;
  min_frequency_fault_min: number;
  min_frequency_fault_max: number;
  max_frequency_fault_min: number;
  max_frequency_fault_max: number;
  over_temperature_fault_min: number;
  over_temperature_fault_max: number;
  phase_failure_alert_min: number;
  phase_failure_alert_max: number;
  low_voltage_alert_min: number;
  low_voltage_alert_max: number;
  high_voltage_alert_min: number;
  high_voltage_alert_max: number;
  voltage_imbalance_alert_min: number;
  voltage_imbalance_alert_max: number;
  min_phase_angle_alert_min: number;
  min_phase_angle_alert_max: number;
  max_phase_angle_alert_min: number;
  max_phase_angle_alert_max: number;
  min_frequency_alert_min: number;
  min_frequency_alert_max: number;
  max_frequency_alert_min: number;
  max_frequency_alert_max: number;
  over_temperature_alert_min: number;
  over_temperature_alert_max: number;
  low_voltage_recovery_min: number;
  low_voltage_recovery_max: number;
  high_voltage_recovery_min: number;
  high_voltage_recovery_max: number;
  seed_time_min: number;
  seed_time_max: number | null;
  start_timing_offset_min: number;
  start_timing_offset_max: number | null;
  dry_run_protection_fault_min: number;
  dry_run_protection_fault_max: number;
  over_load_fault_min: number;
  over_load_fault_max: number;
  locked_router_fault_min: number;
  locked_router_fault_max: number;
  output_phase_failure_min: number | null;
  output_phase_failure_max: number | null;
  current_imbalance_fault_min: number;
  current_imbalance_fault_max: number;
  dry_run_protection_alert_min: number;
  dry_run_protection_alert_max: number;
  over_load_alert_min: number;
  over_load_alert_max: number;
  locked_router_alert_min: number;
  locked_router_alert_max: number;
  current_imbalance_alert_min: number;
  current_imbalance_alert_max: number;
  full_load_current_min: number;
  full_load_current_max: number;
  created_at: string;
  updated_at: string;
  over_load_recovery_min: number;
  over_load_recovery_max: number;
  locked_router_recovery_min: number;
  locked_router_recovery_max: number;

  current_imbalance_recovery_min: number;
  current_imbalance_recovery_max: number;
}

export interface StarterBoxSettingsProps {
  isOpen?: boolean;
  onClose?: () => void;
  hideTrigger?: boolean;
  hideTriggerOne?: boolean;
  setShowSettings?: Dispatch<SetStateAction<boolean>>;
  gateway: string;
  deviceId?: string;
  gatewayData: any;
  isTestDevice: any;
}

export interface DeviceSettingLog {
  id: number;
  created_at: string;
  updated_at: string;
  acknowledgement: string;
  is_new_configuration_saved: number;
}

export interface Pagination {
  total_records: number;
  total_pages: number;
  page_size: number;
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
}

export interface DeviceSettingLogsResponse {
  pagination: Pagination;
  data: DeviceSettingLog[];
}

export interface StarterBoxSettingsHistoryProps {
  isLoading: boolean;
  allRecords: DeviceSettingLog[];
  isFetching: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  hideTriggerOne?: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  setEditMode: any;
}
export interface StarterBoxSettingsLimitsProps {
  isLoading: boolean;
  minMaxRangeData: any;
  isFetching: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  hideTriggerOne?: boolean;
  refetch: () => void;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  setSettingsEditMode: any;
}
export interface SettingsHistoryQueryParams {
  starter_id: string | null;
  pageIndex: number;
  pageSize: number;
}

export interface ExtendedDeviceSettings extends DeviceSettings {
  power_switch?: number;
  operation_mode?: number;
  flt_en?: number;
}
