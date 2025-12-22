import { useUserDetails } from "@/lib/helpers/userpermission";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getAllPaginatedDeviceData,
  getSingleDeviceAPI,
} from "src/lib/services/deviceses";
import InfoDialogBox from "../core/InfoDialogBox";
import SearchFilter from "../core/SearchFilter";
import TanStackTable from "../core/TanstackTable";

import { useLocationContext } from "../context/LocationContext";
import LocationDropdown from "../core/LocationDropdown";
import UserDropdown from "../core/UsersDropdown";
import { DeviceColumns } from "./DeviceColumns";
import DevicesFilter from "./DevicesFilter";
import AddDevice from "./add";

export function AllDevices() {
  const { isSuperAdmin } = useUserDetails();
  const location = useLocation() as { pathname: string; search: string };
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const searchParams = new URLSearchParams(location.search);
  const initialStatus = searchParams.get("status") || "ALL";
  const initialDeviceDeploymentStatus =
    searchParams.get("device_status") || "ALL";
  const [selectedFiltersCount, setSelectedFiltersCount] = useState(0);
  const pageIndexParam = Number(searchParams.get("current_page")) || 1;
  const pageSizeParam = Number(searchParams.get("page_size")) || 20;


  const [searchString, setSearchString] = useState(
    searchParams.get("search_string") || ""
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [debounceSearchString, setDebounceSearchString] =
    useState(searchString);

  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [deviceDetails, setDeviceDetails] = useState<any>({});

  const [deviceId, setDeviceId] = useState<any>();
  const [isTestDevice, setIsTestDevice] = useState<boolean>(false);
  const [editState, setEditState] = useState<{
    isOpen: boolean;
    device: any | null;
  }>({ isOpen: false, device: null });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<any | null>(null);
  const [assignedMember, setAssignUserMember] = useState<any>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>(
    initialDeviceDeploymentStatus
  );
  const [powerStatus, setPowerStatus] = useState<string | null>(null);
  const [deviceStatusFilter, setDeviceStatusFilter] =
    useState<string>(initialStatus);
  const [devicesCount, setDevicesCount] = useState<{
    total_devices_count: number;
    active_devices_count: number;
  }>({ total_devices_count: 0, active_devices_count: 0 });

  const [sortBy, setSortBy] = useState<any>(
    searchParams.get("sort_by") || null
  );
  const [sortType, setSortType] = useState<any>(
    searchParams.get("sort_type") || null
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const {
    locations,
    selectedLocation,
    locationSearchString,
    setLocationSearchString,
    isLocationsLoading,
    setIsLocationSelectOpen,
    handleLocationChange,
    handleClearLocation,
    users,
    selectedUser,
    userSearchString,
    setUserSearchString,
    isUsersLoading,
    setIsUserSelectOpen,
    handleUserChange,
    handleClearUser,
  } = useLocationContext();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch: refetchDevices,
  } = useInfiniteQuery({
    queryKey: [
      "devices",
      debounceSearchString,
      pageSizeParam,
      selectedStatus,
      selectedUser,
      selectedLocation,
      powerStatus,
      sortBy,
      sortType,
      deviceStatusFilter,
    ],
    queryFn: async ({ pageParam = pageIndexParam }) => {
      const queryParams: any = {
        pageIndex: pageParam,
        pageSize: pageSizeParam,
        ...(debounceSearchString && { search_string: debounceSearchString }),
        ...(selectedStatus && selectedStatus !== "ALL"
          ? { device_status: selectedStatus }
          : {}),
        ...(powerStatus && { power: powerStatus }),
        ...(deviceStatusFilter && deviceStatusFilter !== "ALL"
          ? { status: deviceStatusFilter }
          : {}),
        ...(selectedUser && { user_id: selectedUser?.id }),
        ...(selectedLocation && { location_id: selectedLocation?.id }),
        ...(sortBy && { sort_by: sortBy }),
        ...(sortType && { sort_type: sortType }),
      };
      const response = await getAllPaginatedDeviceData(queryParams);
      const { records: devices = [], pagination } = response?.data?.data || {};
      setAssignUserMember((prevMembers: any) => {
        const newUsers = devices
          .map((device: any) => device?.user)
          .filter(
            (user: any) =>
              user?.id &&
              !prevMembers.some((member: any) => member.id === user.id)
          );
        return [...prevMembers, ...newUsers];
      });
   

      return {
        data: devices,
        pagination: pagination || {
          page_size: pageSizeParam,
          total_pages: 0,
          total_records: 0,
        },
        total_devices_count: response?.data?.data?.total_devices_count || 0,
        active_devices_count: response?.data?.data?.active_devices_count || 0,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.pagination) return undefined;
      if (lastPage.pagination.current_page < lastPage.pagination.total_pages) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const handleDeviceDeploymentStatusChange = (status: string) => {
    setSelectedStatus(status);
  };
  const handleDeviceStatusChange = (status: string) => {
    setDeviceStatusFilter(status);
  };

  const deviceData = useMemo(() => {
    setDevicesCount({
      total_devices_count: data?.pages?.[0]?.total_devices_count || 0,
      active_devices_count: data?.pages?.[0]?.active_devices_count || 0,
    });
    const devices = data?.pages.flatMap((page) => page.data) || [];
    return devices;
  }, [data]);

    const { data: singleDeviceData } = useQuery({
    queryKey: ["single-device", deviceId],
    queryFn: async () => {
      if (!deviceId) return null;
      const response = await getSingleDeviceAPI(deviceId);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch device data");
      }
      return response?.data?.data[0] || {};
    },
    enabled: !!deviceId,
    staleTime: 5 * 60 * 1000,
  });
  

  const observer = useRef<IntersectionObserver | null>(null);
  const lastRowRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (isFetching || isFetchingNextPage || !hasNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage) {
            fetchNextPage();
          }
        },
        { root: null, rootMargin: "0px", threshold: 0.1 }
      );
      if (node) observer.current.observe(node);
    },
    [isFetching, isFetchingNextPage, hasNextPage, fetchNextPage]
  );

 
 const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setDebounceSearchString(searchString);
  };

  const handleRowClick = (device: any) => {
    const deviceId = device?.id;
    const firstMotorId = device?.motors?.[0]?.id;

    if (!deviceId || !firstMotorId) {
      console.warn("Missing deviceId or motorId", { deviceId, firstMotorId });
      return;
    }
    navigate({
      to: `/devices/${deviceId}/motors/${firstMotorId}`,
      search: {
        search_string: debounceSearchString || undefined,
      },
      replace: true,
    });
  };
  const handleInfoDialogClick = useCallback((device: any) => {
    setIsInfoDialogOpen(true);
    setDeviceDetails({
      id: device?.id,
      name: device?.name || "",
      serial_no: device?.mcu_serial_no || "",
      mac_address: device?.mac_address || "",
      pcb_number: device?.pcb_number || "",
      test_date: device?.test_date || "",
      deployed_date: device?.deployed_date || "",
    });
  }, []);

 
  const handleDeleteClick = useCallback((device: any) => {
    setIsDeleteDialogOpen(true);
    setDeviceToDelete(device);
  }, []);

  useEffect(() => {
    if (singleDeviceData?.device_status) {
      setIsTestDevice(
        singleDeviceData.device_status === "TEST" ||
        singleDeviceData.device_status === "DEPLOYED"
      );
    }
  }, [singleDeviceData?.device_status]);
  

  useEffect(() => {
    navigate({
      to: "/devices",
      search: {
        search_string: debounceSearchString || undefined,
        device_status: selectedStatus !== "ALL" ? selectedStatus : undefined,
        status: deviceStatusFilter !== "ALL" ? deviceStatusFilter : undefined,
        user_id: selectedUser?.id || undefined,
        location_id: selectedLocation?.id || undefined,
        power_status: powerStatus || undefined,
        sort_by: sortBy || undefined,
        sort_type: sortType || undefined,
      } as any,
      replace: true,
    });
  }, [
    debounceSearchString,
    selectedLocation,
    selectedUser,
    selectedStatus,
    sortBy,
    sortType,
    powerStatus,
    deviceStatusFilter,
    navigate,
  ]);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceSearchString(searchString);
    }, 800);

    return () => {
      clearTimeout(handler);
    };
  }, [searchString]);

  useEffect(() => {
    if (selectedStatus !== "ALL" && deviceStatusFilter !== "ALL") {
      setSelectedFiltersCount(2);
    } else if (
      (selectedStatus !== "ALL" && deviceStatusFilter === "ALL") ||
      (selectedStatus === "ALL" && deviceStatusFilter !== "ALL")
    ) {
      setSelectedFiltersCount(1);
    } else {
      setSelectedFiltersCount(0);
    }
  }, [selectedStatus, deviceStatusFilter]);

  return (
    <div className="w-full flex justify-between text-xs 3xl:text-sm  h-full bg-white">
      <div className="w-[65%] p-3 space-y-2  border-r border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 ">
            <div className="w-[250px]">
              <UserDropdown
                users={users}
                selectedUser={selectedUser}
                isUsersLoading={isUsersLoading}
                searchString={userSearchString}
                setSearchString={setUserSearchString}
                setIsSelectOpen={setIsUserSelectOpen}
                handleUserChange={handleUserChange}
                handleClearUser={handleClearUser}
              />
            </div>

            <div className="w-[250px]">
              <LocationDropdown
                pond={{ location: selectedLocation?.id }}
                locations={locations}
                isLocationsLoading={isLocationsLoading}
                searchString={locationSearchString}
                setSearchString={setLocationSearchString}
                setIsSelectOpen={setIsLocationSelectOpen}
                handlePondLocationChange={handleLocationChange}
                selectedLocation={selectedLocation}
                handleClearLocation={handleClearLocation}
              />
            </div>
          </div>

          <div className="flex items-center gap-2  justify-end ">
            <form
              onSubmit={handleSearchSubmit}
              className={`
              flex items-center gap-1.5 rounded-md h-8 transition-all duration-200 overflow-hidden
              ${isSearchOpen ? "border border-slate-200 w-[50%] px-2" : "w-8 px-0 justify-center border-transparent"} 
            `}
            >
              {!isSearchOpen && (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="text-gray-500 hover:text-gray-700 transition-all duration-200  border-2 
                            p-1.5 rounded-full hover:bg-gray-100 active:scale-95"
                >
                  <SearchIcon className="w-4 h-4" />
                </button>
              )}

              {isSearchOpen && (
                <SearchFilter
                  searchString={searchString}
                  setSearchString={setSearchString}
                  title="Search devices"
                  className="h-full w-full"
                />
              )}
            </form>

            <DevicesFilter
              handleDeviceDeploymentStatusChange={
                handleDeviceDeploymentStatusChange
              }
              handleDeviceStatusChange={handleDeviceStatusChange}
              deviceStatusFilter={deviceStatusFilter}
              selectedStatus={selectedStatus}
              selectedFiltersCount={selectedFiltersCount}
            />
            {isSuperAdmin() && <AddDevice />}
          </div>
        </div>
        <div
          id="devicesTable"
          className="relative bg-inherit overflow-auto hide-scrollbar"
          style={{ maxHeight: "calc(100vh - 150px)" }}
        >
          <TanStackTable
            columns={DeviceColumns({
              refetchDevices,
              handleInfoDialogClick,
              //   handleSettingsClick,
              setEditState,
              handleDelete: handleDeleteClick,
              debounceSearchString,
              assignedMember,
              // onViewRawData: handleViewRawData,
            })}
            data={deviceData}
            loading={isFetching && !isFetchingNextPage}
            getData={refetchDevices}
            lastRowRef={lastRowRef}
            isFetchingNextPage={isFetchingNextPage}
            onRowClick={handleRowClick}
            heightClass="h-tableheght"
            sortBy={sortBy}
            sortType={sortType}
            setSortBy={setSortBy}
            setSortType={setSortType}
            removeSortingForColumnIds={[
              "serial",
              "actions",
              "user_name",
              "device_status",

              "device_serial_number",

              "status",
              "power_present",
              "voltage_current",
              "state",
              "signal_quality",
              "mode",
              "alert_count",
              "fault_count",
            ]}
          />
        </div>
      </div>
      <div className="w-[35%] overflow-hidden">
        <Outlet />
      </div>

      {isInfoDialogOpen && (
        <InfoDialogBox
          openOrNot={isInfoDialogOpen}
          onCancelClick={() => setIsInfoDialogOpen(false)}
          deviceDetails={deviceDetails}
        />
      )}     
    </div>
  );
}
