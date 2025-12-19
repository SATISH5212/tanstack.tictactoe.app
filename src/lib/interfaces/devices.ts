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