import { SetStateAction } from "react";

export interface EditDeviceSheetProps {
  device: {
    id: string;
    serial_no: string;
    title: string;
    ipv6: string;
    mac_address: string;
    user_id: number;
    gateway_id: string;
    motor_count: number;
    status: "ACTIVE" | "INACTIVE";
    // gatewayTitle:any
  } | null;
  onClose: () => void;
  //   onUpdate: () => void;
  gateways: any;
  refetch: () => void;
}

export interface GatewayPayload {
  title: string;
  location_id?: any;
  user_id: number;
  id?: number;
}

export interface AddGatewayProps {
  gateway?: any;
  isEditMode?: boolean;
  locations: { id: number; title: string }[];
  user_id: any;
  location_id?: number;
  refetch: any;
  gateways: any;
}
export interface GetAllPaginatedUsersPropTypes {
  pageIndex: number;
  pageSize: number;
  search_string: string;
}

export interface LoadingComponentProps {
  loading: boolean;
  message?: string;
  className?: string;
}
export interface ISearchFilters {
  searchString: string;
  setSearchString: any;
  title?: string;
  className?: string;
   setIsSearchOpen?: React.Dispatch<React.SetStateAction<boolean>> | undefined;
}

export interface LocationPayload {
  title: string;

  id?: number;
  location_coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface AddLocationProps {
  location?: LocationPayload;
  isEditMode?: boolean;
  userId: any;
  refetch: any;
}