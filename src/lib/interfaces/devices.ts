export interface DevicesFilterProps {
    handleDeviceDeploymentStatusChange: (status: string) => void;
    handleDeviceStatusChange: (status: string) => void;
    deviceStatusFilter: string;
    selectedStatus: string;
    selectedFiltersCount: number;
}
