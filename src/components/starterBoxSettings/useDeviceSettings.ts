
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  DeviceSettings,
  DeviceSettingsData,
  DeviceSettingsLimits,
  SettingsHistoryQueryParams,
} from "src/lib/interfaces/core/settings";
import {
  getAllDeviceSettingsAPI,
  getDeviceSettingLogsAPI,
  getMinMaxRangeAPI,
  sendDeviceSettingsAPI,
} from "src/lib/services/deviceSettings";

export const useDeviceSettings = (deviceId: any, isOpen: any) => {
  const [apiCall, setApiCall] = useState(false);
  const queryClient = useQueryClient();
  const enabled = !!deviceId;

  const {
    data: deviceSettingsData,
    isFetching: isFetchingDeviceSettings,
    isLoading: isLoadingDeviceSettings,
  } = useQuery<any>({
    queryKey: ["device-Settings", deviceId],
    queryFn: async () => {
      if (!deviceId) return null;
      const response = await getAllDeviceSettingsAPI(deviceId);
      setApiCall(true);
      return response.data?.data;
    },
    enabled: isOpen && !!deviceId,
    refetchOnWindowFocus: false,
    staleTime: 0,
    retry: false,
  });

  const { data: minMaxRangeData, refetch: refetchMinMax } =
    useQuery<DeviceSettingsLimits | null>({
      queryKey: ["min-max-range", deviceId],
      queryFn: async () => {
        if (!deviceId) return null;
        const response = await getMinMaxRangeAPI(deviceId);
        setApiCall(true);
        return response.data?.data;
      },
      enabled: isOpen && !!deviceId,
      refetchOnWindowFocus: false,
      staleTime: 0,
    });

  const { mutate: sendSettings } = useMutation({
    mutationFn: ({
      deviceId,
      payload,
    }: {
      deviceId: string;
      payload: DeviceSettings;
    }) => sendDeviceSettingsAPI(deviceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["device-Settings", deviceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["devices-settings-history", deviceId],
      });
      toast.success("Settings saved successfully");
    },
    onError: (err) => {
      console.error("API update error:", err);
      toast.error("Failed to save settings");
    },
  });

  return {
    deviceSettingsData,
    isFetchingDeviceSettings,
    isLoadingDeviceSettings,
    minMaxRangeData,
    refetchMinMax,
    sendSettings,
    apiCall,
  };
};

export const useDeviceSettingsHistory = (
  deviceId: string | null,
  apiCall: boolean,
  pageSize: number = 15
) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["devices-settings-history", deviceId],
    queryFn: async ({ pageParam = 1 }) => {
      const queryParams: SettingsHistoryQueryParams = {
        starter_id: deviceId ?? null,
        pageIndex: pageParam as number,
        pageSize: pageSize,
      };

      const response = await getDeviceSettingLogsAPI(queryParams);
      const deviceSettinhgsHistory = response?.data?.data?.data || [];
      const pagination = response?.data?.data?.pagination || {
        current_page: pageParam,
        page_size: pageSize,
        total_pages: 0,
        total_records: 0,
      };

      return {
        data: deviceSettinhgsHistory,
        pagination,
      };
    },
    enabled: !!deviceId && apiCall,
    initialPageParam: 1,
    retry: false,
    staleTime: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.pagination) return undefined;
      if (lastPage.pagination.current_page < lastPage.pagination.total_pages) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
  });

  const allRecords = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  return {
    allRecords,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  };
};
