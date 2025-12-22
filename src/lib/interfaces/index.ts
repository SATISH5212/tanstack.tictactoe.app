
export interface EditDeviceSheetProps {
  device: {
    id: string;
    serial_no: string;
    title: string;
    ipv6: string;
    mac_address: string;
    user_id: number;
    motor_count: number;
    status: "ACTIVE" | "INACTIVE";
  } | null;
  onClose: () => void;
  onUpdate: () => void;
  gateways: any;
  refetch: () => void;
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

