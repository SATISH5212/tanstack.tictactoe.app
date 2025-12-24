import { useScrolldownObserver } from "@/hooks/core/useScrolldownObserver";
import { useDeviceMutation } from "@/hooks/devices/useDeviceMutation";
import { useDevicesQuery } from "@/hooks/devices/useDeviceQueries";
import { getInitialDeviceQueryParams } from "@/lib/helpers/map/devices/deviceQueryParams";
import { useDebouncedValue } from "@/lib/helpers/useDebouncedValue";
import { useUserDetails } from "@/lib/helpers/userpermission";
import { Outlet, useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocationContext } from "../context/LocationContext";
import DeleteDialog from "../core/DeleteDialog";
import EditDeviceSheet from "../core/EditDeviceSheet";
import LocationDropdown from "../core/LocationDropdown";
import SearchFilter from "../core/SearchFilter";
import TanStackTable from "../core/TanstackTable";
import UserDropdown from "../core/UsersDropdown";
import { DeviceColumns } from "./DeviceColumns";
import DevicesFilter from "./DevicesFilter";
import AddDevice from "./add";

const AllDevices = () => {
  const { isSuperAdmin } = useUserDetails();
  const location = useLocation() as { pathname: string; search: string };
  const navigate = useNavigate();
  const initialParams = getInitialDeviceQueryParams(location.search);
  const { device_id } = useParams({ strict: false })
  const [searchString, setSearchString] = useState(initialParams.searchString);
  const [selectedStatus, setSelectedStatus] = useState(
    initialParams.deploymentStatus
  );
  const [deviceStatusFilter, setDeviceStatusFilter] = useState(initialParams.deviceStatus);
  const [devicePowerFilter, setDevicePowerFilter] = useState(initialParams.power);
  const [sortBy, setSortBy] = useState<string | null>(initialParams.sortBy);
  const [sortType, setSortType] = useState<string | null>(
    initialParams.sortType
  );

  const debouncedSearchString = useDebouncedValue(searchString, 800);

  const [selectedFiltersCount, setSelectedFiltersCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [assignedMember, setAssignUserMember] = useState<any[]>([]);

  const [editState, setEditState] = useState<{
    isOpen: boolean;
    device: any | null;
  }>({ isOpen: false, device: null });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);


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

  const { deleteDeviceMutation } = useDeviceMutation();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch: refetchDevices,
  } = useDevicesQuery({
    search: debouncedSearchString,
    page_size: initialParams.page_size,
    deploymentStatus: selectedStatus,
    deviceStatus: deviceStatusFilter,
    power: devicePowerFilter,
    user: selectedUser,
    location: selectedLocation,
    sortBy,
    sortType,
    pageIndex: initialParams.pageIndex,
  });

  const deviceData = useMemo(
    () => data?.pages.flatMap((p) => p.data) || [],
    [data]
  );


  const confirmDeviceDelete = useCallback(() => {
    if (!deviceToDelete) return;
    setDeleteLoading(true);
    deleteDeviceMutation.mutate(deviceToDelete.id, {
      onSettled: () => {
        setDeleteLoading(false);
        setIsDeleteDialogOpen(false);
        setDeviceToDelete(null);
      },
    });
  }, [deviceToDelete, deleteDeviceMutation]);

  useEffect(() => {
    setSelectedFiltersCount(
      Number(selectedStatus !== "ALL") + Number(deviceStatusFilter !== "ALL") + Number(devicePowerFilter !== "ALL")
    );
  }, [selectedStatus, deviceStatusFilter, devicePowerFilter]);

  const { lastRowRef } = useScrolldownObserver({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
    dataLength: deviceData.length,
    containerId: "devicesTable",
  });

  return (
    <div className="w-full flex justify-between h-full bg-white">
      <div className="w-[65%] p-3 space-y-2 border-r border-slate-200">
        <div className="flex items-center justify-between h-[30px] ">
          <div className="flex gap-4 ">
            <div className="w-[200px]">
              <UserDropdown
                users={users}
                selectedUser={selectedUser}
                isUsersLoading={isUsersLoading}
                searchString={userSearchString}
                setSearchString={setUserSearchString}
                setIsSelectOpen={setIsUserSelectOpen}
                handleUserChange={handleUserChange}
                handleClearUser={handleClearUser}
                width="w-[200px]"
                height="h-8"
                borderClass="border border-gray-300"
              />
            </div>
            <div className="w-[200px]">
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

          <div className="flex items-center gap-2  ">
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className={`flex items-center gap-1.5 h-8 transition-all rounded-md ${isSearchOpen ? "border px-2 w-[300px]" : "w-8 justify-center"
                }`}
            >
              {!isSearchOpen && (
                <button type="button" onClick={() => setIsSearchOpen(true)}>
                  <SearchIcon className="w-4 h-4" />
                </button>
              )}
              {isSearchOpen && (
                <SearchFilter
                  searchString={searchString}
                  setSearchString={setSearchString}
                  title="Search devices"
                  className="w-full h-full"
                  setIsSearchOpen={setIsSearchOpen}
                />
              )}
            </form>

            <DevicesFilter
              selectedStatus={selectedStatus}
              deviceStatusFilter={deviceStatusFilter}
              devicePowerFilter={devicePowerFilter}
              selectedFiltersCount={selectedFiltersCount}
              handleDeviceDeploymentStatusChange={setSelectedStatus}
              handleDeviceStatusChange={setDeviceStatusFilter}
              handleDevicePowerChange={setDevicePowerFilter}
            />

            {isSuperAdmin() && <AddDevice />}
          </div>
        </div>

        <div
          id="devicesTable"
          className="relative flex-1 overflow-auto h-[calc(100vh-140px)]"
        >
          <TanStackTable
            columns={DeviceColumns({
              refetchDevices,
              setEditState,
              handleDelete: (d) => {
                setDeviceToDelete(d);
                setIsDeleteDialogOpen(true);
              },
              debounceSearchString: debouncedSearchString,
              assignedMember,
            })}
            data={deviceData}
            loading={isFetching && !isFetchingNextPage}
            lastRowRef={lastRowRef}
            isFetchingNextPage={isFetchingNextPage}
            onRowClick={(device: any) =>
              navigate({
                to: `/devices/${device.id}/motors/${device.motors?.[0]?.id}`,
              })
            }
            sortBy={sortBy}
            sortType={sortType}
            setSortBy={setSortBy}
            setSortType={setSortType}
            removeSortingForColumnIds={["actions", "power", "location", "user", "voltage_current", "state", "signal_quality", "mode", "mac_address"]}
            isSelecdtedId={device_id as string}
          />
        </div>
      </div>

      <div className="w-[35%] overflow-hidden">
        <Outlet />
      </div>

      {editState.isOpen && (
        <EditDeviceSheet
          device={editState.device}
          onClose={() => setEditState({ isOpen: false, device: null })}
          refetch={refetchDevices}
        />
      )}

      {isDeleteDialogOpen && (
        <DeleteDialog
          openOrNot
          onCancelClick={() => setIsDeleteDialogOpen(false)}
          onOKClick={confirmDeviceDelete}
          label="Are you sure you want to delete this device?"
          deleteLoading={deleteLoading}
          buttonLable="Delete"
          buttonLabling="Deleting..."
        />
      )}
    </div>
  );
};

export default AllDevices;