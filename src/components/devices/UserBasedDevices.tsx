import DeleteDialog from "src/components/core/DeleteDialog";
import EditDeviceSheet from "src/components/core/EditDeviceSheet";
import InfoDialogBox from "src/components/core/InfoDialogBox";

import { getGatewayTitleAPI } from "@/lib/services/deviceses";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Outlet,
  useNavigate,
  useParams,
  useRouter,
} from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Tabs from "src/components/core/Tabs";
import {
  downloadCSV,
  exportDataInConvertToCSV,
} from "src/lib/constants/exportDeviceData";
import {
  deleteUsersDeviceAPI,
  exportUsersDevicesAPI,
  getSingleUserDevicesAPI,
} from "src/lib/services/users";
import { MotorDetailsDrawer } from "../deviceSettings/MotorDetailsDrawer";
import StarterBoxSettings from "../StarterBoxSettings";
import UserDeviceComboxes from "./UserDeviceComboxes";

const UserBasedDevices = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user_id, device_id } = useParams({ strict: false });
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [gateway, setGateway] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [editState, setEditState] = useState<{
    isOpen: boolean;
    device: any | null;
  }>({ isOpen: false, device: null });

  const [noDeviceData, setNoDeviceData] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deviceDetails, setDeviceDetails] = useState<any>({});
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<any | null>(null);
  const [gateways, setGateways] = useState([]);
  const [deviceId, setDeviceId] = useState<string>("");
  const searchParams = new URLSearchParams(location.search);
  const [searchString, setSearchString] = useState<any>(
    searchParams.get("search_starter_box") || ""
  );
  const [userGatewayTitle, setUserGatewayTitle] = useState<any>(null);
  const [userGatewayId, setUserGatewayId] = useState<any>(null);
  const [debounceSearchString, setDebounceSearchString] =
    useState(searchString);
  const navigate = useNavigate();
  const [isMotorDrawerOpen, setIsMotorDrawerOpen] = useState(false);
  const [selectedMotor, setSelectedMotor] = useState<any>(null);
  const [selectedDeviceForDrawer, setSelectedDeviceForDrawer] =
    useState<any>(null);
  const [sortBy, setSortBy] = useState<any>(null);
  const [sortType, setSortType] = useState<any>(null);
  const [userMotorCounts, setUserMotorCounts] = useState<any>({});
  const [deviceStatusFilter, setDeviceStatusFilter] = useState<any>(null);

  const [devicesCount, setDevicesCount] = useState<{
    total_devices_count: number;
    active_devices_count: number;
  }>({ total_devices_count: 0, active_devices_count: 0 });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: [
      "eachUserDevices",
      user_id,
      debounceSearchString,
      sortBy,
      sortType,
      deviceStatusFilter,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      let queryParams: any = {
        ...(debounceSearchString && {
          search_starter_box: debounceSearchString,
        }),
        page: pageParam,
        limit: 10,
        ...(sortBy && { sort_by: sortBy }),
        ...(sortType && { sort_type: sortType }),
        ...(deviceStatusFilter ? { status: deviceStatusFilter } : {}),
      };
      const response = await getSingleUserDevicesAPI(
        queryParams,
        user_id as string
      );
      if (response.status === 200 || response.status === 201) {
        const devices = response?.data?.data?.records || [];
        const newCounts = devices.reduce((acc: any, device: any) => {
          acc[device.id] = device.capable_motors || 1;
          return acc;
        }, {});
        setUserMotorCounts((prev: any) => ({ ...prev, ...newCounts }));
        const pagination = response?.data?.data?.pagination || {
          current_page: pageParam,
          total_pages: 1,
          page_size: 10,
        };
        if (devices.length === 0) {
          setNoDeviceData(true);
        } else {
          setNoDeviceData(false);
        }
        return {
          data: devices,
          pagination,
          total_devices_count: response?.data?.data?.total_count || 0,
          active_devices_count: response?.data?.data?.active_count || 0,
        };
      } else {
        throw new Error("Failed to fetch devices data");
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination) return undefined;
      if (lastPage.pagination.current_page < lastPage.pagination.total_pages) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
    enabled: !!user_id,
    refetchOnWindowFocus: false,
  });

  const { data: gatewayData, refetch: refetchGateway } = useQuery({
    queryKey: ["getgatewaytitle"],
    queryFn: async () => {
      const response = await getGatewayTitleAPI();
      return response.data?.data;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (gatewayData) {
      setUserGatewayId(gatewayData.id);
      setUserGatewayTitle(gatewayData.title);
    }
  }, [gatewayData]);

  const exportDevicesMutation = useMutation({
    mutationFn: async (queryParams: any) => {
      if (!selectedDeviceIds.length) {
        throw new Error();
      }
      const params: any = {
        starter_ids:
          selectedDeviceIds.length === allDevices.length
            ? "all"
            : selectedDeviceIds.join(","),
        ...queryParams,
      };
      const response = await exportUsersDevicesAPI(user_id as string, params);
      if (response.status === 200 || response.status === 201) {
        const exportDevice = response?.data?.data || [];
        const csvData: string = exportDataInConvertToCSV(exportDevice);
        downloadCSV(csvData, "devices_history");

        return exportDevice;
      } else if (response.status === 404) {
        toast.error(response?.data?.message);
        throw new Error();
      } else {
        throw new Error();
      }
    },
    onSuccess: (response: any) => {
      toast.success(
        response?.data?.message || "Device Data Exported Successfully"
      );
    },
    onError: (error: any) => {
      toast.error(error?.message);
    },
  });

  const deletedeviceMutation = useMutation({
    mutationFn: (deviceId: string) => deleteUsersDeviceAPI(deviceId),
    onSuccess: (response, deviceId) => {
      if (response?.status === 200 || response?.status === 201) {
        toast.success(response?.data?.message);
        if (deviceId === device_id) {
          setSelectedDeviceId("");
        }
        refetch();
      } else if (response?.status === 409) {
        toast.error(
          response?.data?.message ||
            "Starter box was connected to motors and cannot be deleted"
        );
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.message ||
          "Starter box was connected to motors and cannot be deleted"
      );
    },
  });

  const observer = useRef<IntersectionObserver | null>(null);
  const lastRowRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (isFetchingNextPage || isFetching) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, isFetching, hasNextPage, fetchNextPage]
  );

  useEffect(() => {
    const allDevices = data?.pages.flatMap((page) => page.data) || [];
    setDevicesCount({
      total_devices_count: data?.pages?.[0]?.total_devices_count || 0,
      active_devices_count: data?.pages?.[0]?.active_devices_count || 0,
    });
    if (allDevices.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(allDevices[0]?.id);
    }
  }, [data, selectedDeviceId]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceSearchString(searchString);
      navigate({
        to: location.pathname,
        search: {
          search_starter_box: searchString || undefined,
          sort_by: sortBy || undefined,
          sort_type: sortType || undefined,
          status: deviceStatusFilter || undefined,
        },
        replace: true,
      });
    }, 1000);
    return () => clearTimeout(handler);
  }, [
    searchString,
    sortBy,
    sortType,
    deviceStatusFilter,
    navigate,
    location.pathname,
  ]);

  const handleDeviceSelect = useCallback(
    (device: any) => {
      setSelectedDeviceId(device?.id);
      queryClient.invalidateQueries({
        queryKey: ["devices-settings-history"],
      });
      router.navigate({
        to: `/users/${user_id}/devices/${device?.id}`,
      });
    },
    [user_id, router, queryClient]
  );

  const handleDeleteClick = useCallback((device: any) => {
    setIsDeleteDialogOpen(true);
    setDeviceToDelete(device);
  }, []);

  const handleInfoDialogClick = useCallback((device: any) => {
    setIsInfoDialogOpen(true);
    setDeviceDetails({
      id: device?.id || "",
      title: device?.title || "",
      serial_no: device?.serial_no || "",
      ipv6: device?.ipv6 || "",
      mac_address: device?.mac_address || "",
      pcb_number: device?.pcb_number || "",
      gateway_name: device?.gateways?.title || "",
      pond_name: device?.pond_name || "",
      test_date: device?.test_date || "",
      deployed_date: device?.deployed_date || "",
    });
  }, []);

  const handleSettingsClick = useCallback((device: any) => {
    setDeviceId(device?.id);
    setShowSettings(true);
    setGateway(device?.gateways?.title);
  }, []);

  const confirmDeviceDelete = useCallback(() => {
    if (deviceToDelete) {
      deletedeviceMutation.mutate(deviceToDelete?.id);
      setIsDeleteDialogOpen(false);
      setDeviceToDelete(null);
    }
  }, [deviceToDelete]);

  const handleSelectedIdsChange = useCallback((ids: string[]) => {
    setSelectedDeviceIds(ids);
  }, []);

  const handleExport = useCallback(
    (queryParams?: any) => {
      exportDevicesMutation.mutate(queryParams);
    },
    [exportDevicesMutation]
  );
  const allDevices = data?.pages.flatMap((page) => page.data) || [];

  const handleViewRawData = useCallback(
    (device: any) => {
      const motorCount =
        userMotorCounts[device.id] || device.capable_motors || 1;
      const defaultMotor = {
        id: "mtr_1",
        title: "Motor 1",
        motor_ref_id: "mtr_1",
        hp: "",
        state: 0,
        pond: { id: "", title: "", location: { id: "", title: "" } },
      };
      setSelectedMotor(defaultMotor);
      setSelectedDeviceForDrawer(device);
      setIsMotorDrawerOpen(true);

      navigate({
        to: `/users/${user_id}/devices/${device?.id}`,
        search: {
          motor_ref_id: "mtr_1",
          capable_motors: motorCount,
        },
        replace: true,
      });
    },
    [
      navigate,
      user_id,
      userMotorCounts,
      setSelectedMotor,
      setSelectedDeviceForDrawer,
      setIsMotorDrawerOpen,
    ]
  );

  const handleCloseMotorDrawer = useCallback(() => {
    setIsMotorDrawerOpen(false);
    setSelectedMotor(null);
    setSelectedDeviceForDrawer(null);
  }, []);

  return (
    <div className="flex bg-white h-user_devices overflow-y-auto border-l  h-[calc(100vh-45px)]">
      <div className="w-custom_55per flex flex-col border-x">
        <div className="flex items-center justify-between">
          <Tabs
            searchString={searchString}
            setSearchString={setSearchString}
            title="Search Devices"
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortType={sortType}
            setSortType={setSortType}
          />
        </div>
        <UserDeviceComboxes
          isFetching={isFetching}
          isFetchingNextPage={isFetchingNextPage}
          isExportLoading={exportDevicesMutation.isPending}
          allDevices={allDevices}
          lastRowRef={lastRowRef}
          device_id={device_id}
          handleClick={handleDeviceSelect}
          setEditState={setEditState}
          handleDelete={handleDeleteClick}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          handleInfoDialogClick={handleInfoDialogClick}
          setShowSettings={setShowSettings}
          handleSettingsClick={handleSettingsClick}
          onSelectedIdsChange={handleSelectedIdsChange}
          selectedDeviceIds={selectedDeviceIds}
          handleExport={handleExport}
          refetch={refetch}
          onViewRawData={handleViewRawData}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortType={sortType}
          setSortType={setSortType}
          devicesCount={devicesCount}
          setDeviceStatusFilter={setDeviceStatusFilter}
        />
      </div>

      {isMotorDrawerOpen && (
        <MotorDetailsDrawer
          isOpen={isMotorDrawerOpen}
          onClose={handleCloseMotorDrawer}
          motor={selectedMotor}
          singleData={selectedDeviceForDrawer ? [selectedDeviceForDrawer] : []}
        />
      )}
      {editState.isOpen && (
        <EditDeviceSheet
          device={editState.device}
          onClose={() => setEditState({ isOpen: false, device: null })}
          refetch={refetch}
          gateways={gateways}
        />
      )}
      {isDeleteDialogOpen && (
        <DeleteDialog
          openOrNot={isDeleteDialogOpen}
          onCancelClick={() => setIsDeleteDialogOpen(false)}
          onOKClick={confirmDeviceDelete}
          label="Are you sure you want to delete this device?"
          deleteLoading={deleteLoading}
        />
      )}
      <div className="w-custom_45per p-3 box-border h-user_devices overflow-auto border-l">
        <Outlet />
      </div>

      {isInfoDialogOpen && (
        <InfoDialogBox
          openOrNot={isInfoDialogOpen}
          onCancelClick={() => setIsInfoDialogOpen(false)}
          deviceDetails={deviceDetails}
        />
      )}
      <StarterBoxSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        hideTrigger={true}
        hideTriggerOne={false}
        setShowSettings={setShowSettings}
        gateway={gateway}
        deviceId={deviceId}
        userGatewayTitle={userGatewayTitle}
      />
    </div>
  );
};

export default UserBasedDevices;
