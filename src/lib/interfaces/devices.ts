export interface DevicesFilterProps {
    handleDeviceDeploymentStatusChange: (status: string) => void;
    handleDeviceStatusChange: (status: string) => void;
    deviceStatusFilter: string;
    selectedStatus: string;
    selectedFiltersCount: number;
}

export interface DeviceFormData {
    name: string;
    mac_address: string;
    pcb_number: string;
    starter_number: string;
};



export interface IAddDeviceOrUserFormProps {
    userId: number;
    onClose: () => void;
};

export interface DeviceFormData {
    name: string;
    mac_address: string;
    pcb_number: string;
    starter_number: string;
};

export interface UseDeviceMutationProps {
    onAddSuccess?: () => void;
    setErrors?: (e: any) => void;
};

export interface GetAllPaginatedUsersPropTypes {
    pageIndex?: number;
    page_size?: number;
    search_string?: string;
    device_status?: any;
    user_id: string;
    location_id: string;
    sort_by: any;
    sort_type: any;
    power: any;
    status: any
}