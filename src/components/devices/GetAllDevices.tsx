import { useUserDetails } from "@/lib/helpers/userpermission";
import { deleteUsersDeviceAPI } from "@/lib/services/users";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { CircleCheck, CircleX, SearchIcon } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import {
  getAllPaginatedDeviceData,
  getGatewayTitleAPI,
  getSingleDeviceAPI,
  updateGatewayTitleAPI,
} from "src/lib/services/deviceses";
import DeleteDialog from "../core/DeleteDialog";
import EditDeviceSheet from "../core/EditDeviceSheet";
import InfoDialogBox from "../core/InfoDialogBox";
import SearchFilter from "../core/SearchFilter";
import TanStackTable from "../core/TanstackTable";
import { MotorDetailsDrawer } from "../deviceSettings/MotorDetailsDrawer";
import StarterBoxSettings from "../StarterBoxSettings";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import UserAddDevice from "../usersModule/addDevice";
import AddDevice from "./add";
import { DeviceColumns } from "./DeviceColumns";
import DevicesFilter from "./DevicesFilter";

export function GetAllDevices() {
  const { isUser, isSuperAdmin } = useUserDetails();
  const location = useLocation() as { pathname: string; search: string };
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { device_id } = useParams({ strict: false });
  const searchParams = new URLSearchParams(location.search);
  const initialStatus = searchParams.get("status") || "ALL";
  const initialDeviceDeploymentStatus =
    searchParams.get("device_status") || "ALL";
  const [selectedFiltersCount, setSelectedFiltersCount] = useState(0);
  const pageIndexParam = Number(searchParams.get("current_page")) || 1;
  const pageSizeParam = Number(searchParams.get("page_size")) || 20;
  const capableMotorsParam = searchParams.get("capable_motors");
  const [capableMotors, setCapableMotors] = useState<number | undefined>(
    capableMotorsParam ? Number(capableMotorsParam) : undefined
  );
  const [searchString, setSearchString] = useState(
    searchParams.get("search_string") || ""
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [debounceSearchString, setDebounceSearchString] =
    useState(searchString);

  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [deviceDetails, setDeviceDetails] = useState<any>({});

  const [showSettings, setShowSettings] = useState(false);
  const [deviceId, setDeviceId] = useState<any>();
  const [gateway, setGateway] = useState<any>(null);
  const [gatewayId, setGatewayId] = useState<any>(null);
  const [isTestDevice, setIsTestDevice] = useState<boolean>(false);
  const [editState, setEditState] = useState<{
    isOpen: boolean;
    device: any | null;
  }>({ isOpen: false, device: null });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<any | null>(null);
  const [errors, setErrors] = useState<{ gateway_title?: string }>({});
  const [title, setTitle] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [showIcons, setShowIcons] = useState(false);
  const [assignedMember, setAssignUserMember] = useState<any>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>(
    initialDeviceDeploymentStatus
  );
  const [isMotorDrawerOpen, setIsMotorDrawerOpen] = useState(false);
  const [selectedMotor, setSelectedMotor] = useState<any>(null);
  const [selectedDeviceForDrawer, setSelectedDeviceForDrawer] =
    useState<any>(null);
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
      if (device_id && pageParam === 1) {
        const selectedDevice = devices.find(
          (device: any) => device.id == device_id
        );
        if (selectedDevice) {
          const gatewayTitle = selectedDevice?.gateways?.title || null;
          setIsTestDevice(
            selectedDevice.device_status === "TEST" ||
            selectedDevice.device_status === "DEPLOYED"
          );
          if (selectedDevice.capable_motors) {
            setCapableMotors(Number(selectedDevice.capable_motors));
          }
        }
      }

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

  const { data: gatewayData, refetch: refetchGateway } = useQuery({
    queryKey: ["getgatewaytitle"],
    queryFn: async () => {
      const response = await getGatewayTitleAPI();
      if (response?.status === 200 || response?.status === 201) {
        setGatewayId(response.data?.data?.id);
        return response.data?.data;
      } else if (response?.status === 422) {
        setErrors(response?.data?.errors || {});
      }
      throw new Error("Failed to fetch gateway");
    },
    enabled: isSuperAdmin(),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
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

  const deletedeviceMutation = useMutation({
    mutationFn: (deviceId: string) => deleteUsersDeviceAPI(deviceId),
    onMutate: async (deviceId) => {
      await queryClient.cancelQueries({
        queryKey: ["devices", debounceSearchString, pageSizeParam],
      });
      const previousData = queryClient.getQueryData([
        "devices",
        debounceSearchString,
        pageSizeParam,
      ]);
      queryClient.setQueryData(
        ["devices", debounceSearchString, pageSizeParam],
        (oldData: any) => {
          if (!oldData?.pages) return oldData;
          const updatedPages = oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((device: any) => device.id !== deviceId),
          }));
          const affectedPageIndex = oldData.pages.findIndex((page: any) =>
            page.data.some((device: any) => device.id === deviceId)
          );
          if (
            affectedPageIndex >= 0 &&
            updatedPages[affectedPageIndex].data.length === 0 &&
            affectedPageIndex < oldData.pages.length - 1
          ) {
            fetchNextPage();
          }
          return { ...oldData, pages: updatedPages };
        }
      );
      return { previousData };
    },
    onSuccess: (response, deviceId) => {
      if (response?.status === 200 || response?.status === 201) {
        if (deviceId === device_id) {
          navigate({ to: "/devices" });
        }
      } else if (response?.status === 409) {
        toast.error(
          response?.data?.message ||
          "Starter box was connected to motors and cannot be deleted"
        );
      }
    },
    onError: (error: any, deviceId, context) => {
      queryClient.setQueryData(
        ["devices", debounceSearchString, pageSizeParam],
        context?.previousData
      );
      toast.error(
        error?.message ||
        "Starter box was connected to motors and cannot be deleted"
      );
    },
  });
  const confirmDeviceDelete = useCallback(() => {
    if (deviceToDelete) {
      setDeleteLoading(true);
      deletedeviceMutation.mutate(deviceToDelete?.id, {
        onSuccess: (response, deviceId) => {
          if (response?.status === 200 || response?.status === 201) {
            toast.success(response?.data?.message);
            if (deviceId === device_id) {
              navigate({ to: "/devices" });
            }

            refetchDevices();
          }
        },
        onSettled: () => {
          setDeleteLoading(false);
          setIsDeleteDialogOpen(false);
          setDeviceToDelete(null);
        },
      });
    }
  }, [
    deviceToDelete,
    deletedeviceMutation,
    device_id,
    navigate,
    refetchDevices,
  ]);

  const toggleShowIcons = () => {
    setShowIcons((prev) => !prev);
  };
  useEffect(() => {
    if (gatewayData?.title) {
      setTitle(gatewayData.title);
      setOriginalTitle(gatewayData.title);
    }
  }, [gatewayData?.title]);

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

  const handleSubmit = async () => {
    try {
      const response = await updateGatewayTitleAPI({ title: title.trim() });
      if (response?.status === 200 || response?.status === 201) {
        toast.success("Gateway title updated successfully");
        setOriginalTitle(title);
        setShowIcons(false);
        setErrors({});
        refetchGateway();
      }
    } catch (error: any) {
      if (error?.status === 422) {
        const gatewayTitleError = error?.data?.errors?.gateway_title;
        setErrors({ gateway_title: gatewayTitleError });
        setShowIcons(true);
      } else if (error?.status === 409) {
        const gatewayTitleError = error?.data?.message;
        setErrors({ gateway_title: gatewayTitleError });
        setShowIcons(true);
      } else {
        toast.error("Something went wrong while updating gateway title");
      }
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setErrors((prevErrors: any) => ({
      ...prevErrors,
      gateway_title: "",
    }));
  };

  const handleViewRawData = useCallback(
    (device: any) => {
      const defaultMotor = {
        id: "mtr_1",
        title: "Motor 1 (M1)",
        motor_ref_id: "mtr_1",
        hp: "",
        state: 0,
        pond: {
          id: "",
          title: "",
          location: {
            id: "",
            title: "",
          },
        },
      };
      setSelectedMotor(defaultMotor);
      setSelectedDeviceForDrawer(device);
      setIsMotorDrawerOpen(true);
      const capableMotorsValue =
        device.capable_motors && device.capable_motors > 0
          ? device.capable_motors
          : device.starterBoxParameters?.length || 1;
      setCapableMotors(capableMotorsValue);

      navigate({
        to: `/devices/${device.id}/motors/mtr_1`,
        search: {
          motor_ref_id: "mtr_1",
          capable_motors: capableMotorsValue,
        },
      });
    },
    [
      navigate,
      debounceSearchString,
      selectedStatus,
      powerStatus,
      setCapableMotors,
    ]
  );

  const handleCloseMotorDrawer = useCallback(() => {
    setIsMotorDrawerOpen(false);
    setSelectedMotor(null);
    setSelectedDeviceForDrawer(null);
  }, []);

  const handleCancel = () => {
    setTitle(originalTitle);
    setShowIcons(false);
    setErrors((prevErrors: any) => ({
      ...prevErrors,
      gateway_title: "",
    }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setDebounceSearchString(searchString);
  };
  const handleRowClick = (device: any) => {
    setCapableMotors(Number(device.capable_motors));
    navigate({
      to: `/devices/${device?.id}/motors`,
      search: {
        search_string: debounceSearchString || undefined,
        capable_motors: Number(device.capable_motors),
      },
      replace: true,
    });
  };
  const handleInfoDialogClick = useCallback((device: any) => {
    setIsInfoDialogOpen(true);
    setDeviceDetails({
      id: device?.id,
      title: device?.title || "",
      serial_no: device?.mcu_serial_no || "",
      ipv6: device?.ipv6 || "",
      mac_address: device?.mac_address || "",
      pcb_number: device?.pcb_number || "",
      gateway_name: device?.gateways?.title || "",
      pond_name: device?.pond_name || "",
      test_date: device?.test_date || "",
      deployed_date: device?.deployed_date || "",
    });
  }, []);

  const handleSettingsClick = useCallback(
    (device: any) => {
      setDeviceId(device?.id);
      setShowSettings(true);
      setGateway(device?.gateways?.title || gatewayData?.title);
    },
    [gatewayData?.title]
  );
  const handleDeleteClick = useCallback((device: any) => {
    setIsDeleteDialogOpen(true);
    setDeviceToDelete(device);
  }, []);
  useEffect(() => {
    if (gatewayData?.id) {
      setGatewayId(gatewayData.id);
    }
  }, [gatewayData?.id]);

  useEffect(() => {
    if (singleDeviceData?.device_status) {
      setIsTestDevice(
        singleDeviceData.device_status === "TEST" ||
        singleDeviceData.device_status === "DEPLOYED"
      );
    }
  }, [singleDeviceData?.device_status]);

  useEffect(() => {
    const targetDeviceId = Number(device_id);
    if (
      device_id &&
      !deviceData.find((d: any) => d.id === targetDeviceId) &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isFetching &&
      data?.pages?.[0]?.pagination?.total_records &&
      deviceData?.length < data.pages[0].pagination.total_records
    ) {
      fetchNextPage();
    }
  }, [
    device_id,
    deviceData,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    data,
  ]);

  useEffect(() => {
    const currentSearchParams = new URLSearchParams(location.search);
    const currentCapableMotors = currentSearchParams.get("capable_motors");
    navigate({
      to: "/devices",
      search: {
        search_string: debounceSearchString || undefined,
        capable_motors: currentCapableMotors
          ? Number(currentCapableMotors)
          : capableMotors || undefined,
        device_status: selectedStatus !== "ALL" ? selectedStatus : undefined,
        status: deviceStatusFilter !== "ALL" ? deviceStatusFilter : undefined,
        power_status: powerStatus || undefined,
        sort_by: sortBy || undefined,
        sort_type: sortType || undefined,
      } as any,
      replace: true,
    });
  }, [
    debounceSearchString,
    selectedStatus,
    sortBy,
    sortType,
    powerStatus,
    capableMotors,
    deviceStatusFilter,
    navigate
  ]);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceSearchString(searchString);
    }, 800);

    return () => {
      clearTimeout(handler);
    };
  }, [searchString]);

  // useEffect(() => {
  //   return () => {
  //     setSearchString("");
  //     setDebounceSearchString("");
  //     navigate({
  //       to: location.pathname,
  //       search: {},
  //       replace: true,
  //     });
  //   };
  // }, [location.pathname]);

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
    <div className="w-full flex justify-between text-xs 3xl:text-sm">
      <div className="w-[65%] p-3 space-y-2 bg-white border-r border-slate-200">
        <div className="w-full flex items-center justify-end gap-4">
          {/* <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-1.5 border border-slate-200 rounded-md w-[30%] px-2 h-8"
          >
            <SearchFilter
              searchString={searchString}
              setSearchString={setSearchString}
              title="Search devices"
              className="h-full w-full "
            />
          </form> */}

          {isSuperAdmin() && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Default GTW :</span>
              <div className="flex-1">
                <Input
                  name="title"
                  value={title}
                  onChange={handleTitleChange}
                  onDoubleClick={toggleShowIcons}
                  placeholder="Gateway Title"
                  className="!text-smd !3xl:text-base rounded-none bg-blue-50 p-2 border-0 shadow-none outline-none focus:outline-none focus-visible:outline-none !focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus:ring-none h-8 w-[100%]"
                />
                {errors?.gateway_title && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.gateway_title}
                  </p>
                )}
              </div>
              {showIcons && (
                <div className="flex gap-2 items-center">
                  <Button
                    className="bg-green-500 hover:bg-green-600 border border-green-500 text-white p-1 h-fit"
                    type="button"
                    onClick={handleSubmit}
                  >
                    <CircleCheck className="size-3" />
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white p-1 h-fit"
                    onClick={handleCancel}
                  >
                    <CircleX className="size-3" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className=" p-1 rounded-md w-fit ">
            <div className="flex gap-2">
              <span className="bg-primary/20  p-1 rounded-md w-fit">
                <Button
                  onClick={() =>
                    navigate({
                      to: `/apfc`,
                      search: { capable_motors: capableMotors },
                    })
                  }
                  className={`text-xs 3xl:text-sm font-medium rounded-md px-3 py-1 h-auto ${location.pathname.includes("/apfc") ? "bg-05A155 text-white hover:bg-05A155" : "bg-transparent ring-0 text-black/60 hover:bg-transparent hover:text-black/80"}`}
                >
                  APFC
                </Button>
                <Button
                  onClick={() =>
                    navigate({
                      to: `/devices`,
                      search: { capable_motors: capableMotors },
                    })
                  }
                  className={`text-xs 3xl:text-sm font-medium rounded-md px-3 py-1 h-auto ${location.pathname.includes("/devices") ? "bg-green-500 text-white hover:bg-green-600" : "bg-transparent ring-0 text-black/60 hover:bg-transparent hover:text-black/80"}`}
                >
                  Starter Box
                </Button>
              </span>
              <span className="flex  space-x-4 items-center text-xs font-normal text-black">
                <div className="">
                  Total:{" "}
                  <span className="text-blue-500">
                    {devicesCount?.total_devices_count}
                  </span>
                </div>
                <div className="">
                  Active:{" "}
                  <span className="text-green-500">
                    {devicesCount?.active_devices_count}
                  </span>
                </div>
              </span>
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
                  className="text-gray-500 hover:text-gray-700 transition-all duration-200  border-2 rounded-md
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
                  setIsSearchOpen={setIsSearchOpen}
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
            {isUser() && <UserAddDevice />}
            {isSuperAdmin() && (
              <AddDevice
                refetchDevices={refetchDevices}
                gatewayId={gatewayId}
              />
            )}
          </div>
        </div>
        <div
          id="devicesTable"
          className="relative bg-inherit overflow-auto"
          style={{ maxHeight: "calc(100vh - 150px)" }}
        >
          <TanStackTable
            columns={DeviceColumns({
              refetchDevices,
              handleInfoDialogClick,
              handleSettingsClick,
              setEditState,
              handleDelete: handleDeleteClick,
              debounceSearchString,
              assignedMember,
              onViewRawData: handleViewRawData,
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
              "line_voltages",
              "state",
              "mode",
              "currents",
              "alert_count",
              "fault_count",
            ]}
          />
        </div>
      </div>
      <div className="w-[35%] overflow-hidden">
        <Outlet />
      </div>

      {isMotorDrawerOpen && (
        <MotorDetailsDrawer
          isOpen={isMotorDrawerOpen}
          onClose={handleCloseMotorDrawer}
          motor={selectedMotor}
          singleData={selectedDeviceForDrawer ? [selectedDeviceForDrawer] : []}
        />
      )}
      {isInfoDialogOpen && (
        <InfoDialogBox
          openOrNot={isInfoDialogOpen}
          onCancelClick={() => setIsInfoDialogOpen(false)}
          deviceDetails={deviceDetails}
        />
      )}
      {editState.isOpen && (
        <EditDeviceSheet
          device={editState.device}
          onClose={() => setEditState({ isOpen: false, device: null })}
          refetch={refetchDevices}
          gateways={""}
        />
      )}
      {isDeleteDialogOpen && (
        <DeleteDialog
          openOrNot={isDeleteDialogOpen}
          onCancelClick={() => setIsDeleteDialogOpen(false)}
          onOKClick={confirmDeviceDelete}
          label="Are you sure you want to delete this device?"
          deleteLoading={deleteLoading}
          buttonLable="Delete"
          buttonLabling="Deleting..."
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
        gatewayData={gatewayData}
        isTestDevice={isTestDevice}
      />
    </div>
  );
}
