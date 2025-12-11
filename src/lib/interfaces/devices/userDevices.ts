export type DeviceStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "OFFLINE";
export interface Device {
  id: number;
  title: string;
  serial_no: number;
  status: string;
  motor_count: number;
}

export interface EditState {
  isOpen: boolean;
  device: Device | null;
}
export interface IUserDeviceBlock {
  isFetching: boolean;
  isFetchingNextPage: boolean;
  allDevices: Device[];
  lastRowRef: (node: HTMLTableRowElement | null) => void;
  device_id?: string;
  handleClick: (device: Device[]) => void;
  setEditState: React.Dispatch<React.SetStateAction<EditState>>;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  handleDelete: (device: Device) => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  handleInfoDialogClick: (device: any) => void;
  handleSettingsClick: (device: any) => void;
}

export interface IHighChartsBlock {
  motorData: any;
  paramater: string;
  starterId?: string;
  dateValue: any;
  setDateValue: any;
  dateRange: any;
  setDateRange: any;
  motor_ref_id:any

}

export interface AssignUserProps {
  open: boolean;
  onClose: () => void;
  getData: (params: any) => void;
  device_id: string;
  deviceData:any
}

export interface UserProps {
  id: number;
  full_name: string;
  created_at: string;
  device_count: number;
  email: string;
  last_active_at: string | null;
  phone: string;
  status: string;
  updated_at: string;
  user_type: string;
}
export interface Devices {
  ipv6: string | undefined;
  id: number;
  title: string;
  serial_no: string;
  motors: {
    id: number;
    title: string;
    hp: string;
    state: number;
    motor_ref_id: string;
    pond: {
      id: number;
      title: string;
      location: {
        id: number;
        title: string;
      };
    };
  }[];
}