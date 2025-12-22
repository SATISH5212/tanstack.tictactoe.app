import { Dispatch, RefObject, SetStateAction } from "react";
import { UsersList } from "./users";

export interface MotorAddData {
  id: number;
  name: string | undefined;
  power: string | undefined;
  location: [number, number];
  motorId: number;
  starterBox?: any
}

export interface StarterAddData {
  id: number;
  name?: string;
  title?: string;
  alias_starter_title?: string;
  location: [number, number]
}
export interface PondData {
  id: string;
  pond_coordinates: number[][];
  area: number;
  name: string;

  location: any;
  motors: MotorAddData[];
  starters: StarterAddData[];
}
export interface IMapIconsPageProps {
  showResults: boolean;
  pond: PondData | null;
  drawMode: string;
  handleLineStringMode: () => void;
  handlePolygonMode: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleDeletePond: () => void;
  handleEdit: () => void;
  canUndo: boolean | null;
  canRedo: boolean | null;
  isPondEditing: boolean;
}

export interface IAddPondSideBarProps {
  pond: PondData | null;
  setPond: (pond: PondData | null) => void;
  handleAddMotor: () => void;
    isAddingMotor: boolean;
   handleMotorNameChange: (motorId: number, newName: string) => void;
  handleMotorPowerChange: (motorId: number, newPower: string) => void;
  handleDeleteMotor: (motorId: number) => void;
   handleCancel: () => void;
  errorMessage: Record<string, string> | null;
  setErrorMessage: Dispatch<SetStateAction<Record<string, string> | null>>;
  pondName: string;
  setPondName: Dispatch<SetStateAction<string>>;
  locationCentroid: number[];
  setIsPondAdding: Dispatch<SetStateAction<boolean>>;

  setIsPondEditing: Dispatch<SetStateAction<boolean>>;
  originalPond: any | null;
  isPondEditing: boolean;
  deleteMotor: (payload: { motorId: number; pondId: number }) => void;
  isDeletingMotorPending: boolean;
  setSelectedLocation?: (location: any) => void;
  setSelectedLocationId?: (id: number | null) => void;
  selectedMotorId: number | null;
  addPondsToMap: () => void;
  addPondRef: RefObject<boolean>;
  addParam: boolean
 
}

export interface IUserLocation {
  id: number;
  title: string;
  gateway_count: number;
  location_coordinates?: {
    lat: number;
    lng: number;
  }
}

export interface ILocationDropdownProps {
  pond: PondData | null;
  locations: IUserLocation[];
  isError: boolean;
  isLocationsLoading: boolean;
  hasNextPage?: boolean;
  locationLoadMoreRef: RefObject<HTMLDivElement | null>;
  searchString: string;
  setSearchString: Dispatch<SetStateAction<string>>;
  setIsSelectOpen: Dispatch<SetStateAction<boolean>>;
  handlePondLocationChange: (value: string) => void;
  selectedLocation: IUserLocation | null;
  isFetchingNextPage: boolean;
}

export interface PondCoordinate {
  lng: number;
  lat: number;
}


export interface StarterBox {
  id: number;
  title: string;
  alias_starter_title: string | null;
  status: string
  mac_address: string;
}

export interface UserDevices {
  id: number;
  title: string;
  alias_starter_title: string | null;
  connected_nodes: string[];
  capable_motors: number;
  starter_coordinates?: PondCoordinate
}


export interface Faults {
  fault_code: number;
  fault_description: string;
  time_stamp: string;
  power_present: string;
}

export interface StarterBoxParameters {
  id: number;
  starter_id: number;
  motor_id: number;
  current_i1: number;
  current_i2: number;
  current_i3: number;
  line_voltage_vry: number;
  line_voltage_vyb: number;
  line_voltage_vbr: number;
  power_present?: string;
  fault_code?: number;
  fault_description?: string;
}

export interface Motor {
  id: number;
  title: string;
  state: number;
  starter_id: number | null;
  motor_ref_id: string | null;
  status: string
  mode: string
  hp: string;
  motor_coordinates: {
    lat: number;
    lng: number;
  };
  starterBoxParameters: StarterBoxParameters[];
  starterBox: StarterBox;
  faults: Faults;
}

export interface Pond {
  id: number;
  title: string;
  location_id: number;
  pond_order: number;
  pond_coordinates: PondCoordinate[];
  acres: string;
  status: "ACTIVE" | "INACTIVE";
  motors: Motor[];
  starters: StarterAddData[]
  location: Location;
  total_motors_count: number;
  motors_on_count: number;
  motors_off_count: number;
  motors_online_count: number;
  motors_offline_count: number;
  power_on_count: number;
  power_off_count: number;
  auto_count: number;
  manual_count: number;
  alert_count: number;
}


export interface IListPondsSideBarProps {
  showDevices: boolean;
  handleBackToPonds: () => void;
  isAddingMotor: boolean;
  handleAdddMotorClick: () => void;
  handleAddPondClick: () => void;
  locationLoadMoreRef: RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
  locations: any[];
  selectedLocationId: number | null;
  setSelectedLocationId: (value: number | null) => void;
  locationSearchString: string;
  setLocationSearchString: (value: string) => void;
  setIsLocationSelectOpen: (open: boolean) => void;
  isLocationsLoading: boolean;
  isLocationsError: boolean;
  hasNextLocationPage: boolean;
  fetchNextLocationPage: any;
}



export interface PondsContextContextType {
  pondsData: any[];
  setSearchString: (searchString: string) => void;
  lastRowRef: (node: HTMLTableRowElement | null) => void;
  searchString: string;
  debounceSearchString: string;
  setDebounceSearchString: (debounceSearchString: string) => void;
  isFetchingNextPage?: boolean;
  isFetching?: boolean;
  pondStatus: string;
  setPondStatus: Dispatch<SetStateAction<string>>;

}

export interface Location {
  id: number;
  name: string;
  title?: string;
  location_coordinates?: {
    lat: number;
    lng: number;
  }
  gateway_count?: number
}


export interface LocationContextType {

  locations: IUserLocation[];
  selectedLocation: IUserLocation | null;
  selectedLocationId: number | null;

  locationSearchString: string;
  debounceLocationSearchString: string;
  setLocationSearchString: (value: string) => void;

  isLocationsLoading: boolean;
  // isLocationsError: boolean;
  // isFetchingNextLocationPage: boolean;

  // hasNextLocationPage: boolean;
  // fetchNextLocationPage: () => void;
  // locationLoadMoreRef: React.RefObject<HTMLDivElement | null>;

  isLocationSelectOpen: boolean;
  setIsLocationSelectOpen: (value: boolean) => void;
  setSelectedLocationId: (id: number | null) => void;
  setSelectedLocation: Dispatch<SetStateAction<IUserLocation | null>>;
  handleLocationChange: (value: string) => void;
  handleClearLocation: () => void;
}


export interface ExtendedLocationContextType extends LocationContextType {
  users: UsersList[];
  selectedUser: UsersList | null;
  selectedUserId: number | null;
  userSearchString: string;
  debounceUserSearchString: string;
  setUserSearchString: (value: string) => void;
  isUsersLoading: boolean;
  // isUsersError: boolean;
  // isFetchingNextUserPage: boolean;
  // hasNextUserPage: boolean;
  // fetchNextUserPage: () => void;
  userLoadMoreRef: React.RefObject<HTMLDivElement | null>;
  isUserSelectOpen: boolean;
  setIsUserSelectOpen: (value: boolean) => void;
  setSelectedUserId: (id: number | null) => void;
  setSelectedUser: (user: UsersList | null) => void;
  handleUserChange: (value: string) => void;
  handleClearUser: () => void;
}

export interface MotorModeProps {
  motor: Motor
  selectedMotorModes: Map<number, { id: number; title: string; newMode: number; mac_address: string; motor_ref_id: string }>;
  onModeChange: (motor: Motor, newMode: number) => void;
}



export interface MotorChange {
  id: number;
  title: string;
  newState?: number;
  newMode?: number;
  mac_address: string;
  motor_ref_id: string;
}

export interface MotorChangeConfirmDialogProps {
  isOpen: boolean;
  type: "state" | "mode";
  changes: Map<number, MotorChange>;
  onCancel: () => void;
  onConfirm: (changes: MotorChange[]) => void;
}


export interface DeviceSelectionDropdownProps {
  motor: Motor;
  refProp: React.RefObject<HTMLDivElement>;
  isReplaceMode: boolean;
  searchString: string;
  setSearchString: (value: string) => void;
  filteredDevices: UserDevices[];
  starterId: string;
  setStarterId: (value: string) => void;
  selectedNodeIndex: number | null;
  setSelectedNodeIndex: (value: number | null) => void;
  handleNodeClick: (nodeIndex: number, device: UserDevices) => void;
  handleCancelClick: () => void;
  handleConnectClick: (motor: Motor) => void;
  isPending: boolean;
  isLoading: boolean
}


export interface IPondMotorsCardProps {
  selectedPond: Pond | null;
  onClose: () => void;
  selectedPondIndex: number | null;
  mapPonds: Pond[];
  dateRange: any

  setDateRange: any
  pondMotors?: Motor[];
  handleBackToPonds: () => void;
  handleMotorContorlPublish: (changes: Map<number, any>) => void;
  handleMotorModePublish: (changes: Map<number, any>) => void;
  motors: Motor[];
  isSinglePondLoading: boolean;
  deleteMotor: (params: { motorId: number; pondId: number }) => void;
  isDeletingMotorPending: boolean;
  setSelectedStarter: (starter: UserDevices | null) => void;
  handleAddStarter: (device: UserDevices) => void;
  handleStarterNodeSelection: (starter: UserDevices, motor: Motor) => void;
  pendingStarterData: {
    starter: UserDevices;
    location: { lat: number; lng: number };
    motor: Motor;
  } | null;
  clearTempStarterMarker: () => void;
}

export interface IMotorCardProps {
  motor: Motor;
  openMotorId: number | null;
  setOpenMotorId: (id: number | null) => void;
  openDropdownMotorId: number | null;
  isReplaceMode: boolean;
  selectedMotors: Map<number, { id: number; title: string; newState: number; mac_address: string; motor_ref_id: string }>;
  selectedMotorModes: Map<number, { id: number; title: string; newMode: number; mac_address: string; motor_ref_id: string }>;
  handleMotorControlToggle: (motor: Motor, newState: number) => void;
  handleMotorModeToggle: (motor: Motor, newMode: number) => void;
  handleReplaceClick: (motor: Motor) => void;
  handleRemoveDeviceClick: (motor: Motor) => void;
  handleConfigClick: (e: React.MouseEvent, motor: Motor) => void;
  deviceSelectionDropdown: (motor: Motor, ref: any) => React.ReactNode;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  replaceDropdownRef: React.RefObject<HTMLDivElement | null>;
  isOwner: () => boolean;
  isManager: () => boolean;
  deleteMotor: (payload: { motorId: number; pondId: number }) => void
  selectedPond: Pond | null
  isDeletingMotorPending: boolean
}

export interface PondStatusChangeDialogProps {
  isOpen: boolean;
  type: "pondStatus" | "deviceStatus";
  isPending: boolean;
  changes: Map<number, string>;
  onCancel: () => void;
  onConfirm: (changes: Map<number, string>) => void;
  pondStatus: string
}

export interface PondStatusChangePayload {
  pondIds: number[];
  status: "ACTIVE" | "INACTIVE";
}
