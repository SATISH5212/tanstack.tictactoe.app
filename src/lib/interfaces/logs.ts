 export interface LogsSheetProps {
   pondTitle?: string;
   pond: any;
   refetch: () => void;
   refetchDeviceLogs: () => void;
   fetchNextDevicePage: () => void;
   hasNextDevicePage: boolean;
   isFetchingNextDevicePage: boolean;
   isLoading: boolean;
   isLoadingDevice: boolean;
   fetchNextPage: () => void;
   hasNextPage: boolean;
   isFetchingNextPage: boolean;
   handlepondClick: (pond_id: number) => void;
   handleDeviceClick: (pond_id: string) => void;
   pondId: number;
   ipv6: string;
   logs: {
     pond_id: number;
     log_type: string;
     log_data: string;
     created_at: string;
   }[];
   devicelogs: {
     device_name: string;
     logs: {
       log_type: string;
       log_data: string;
       created_at: string;
     }[];
   }[];
   handleStatusToggle: any;
   deviceLogStatus: any;
  
 }
  