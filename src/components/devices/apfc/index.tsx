import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import AssignUserDialog from "src/components/core/AssignUserDialog";
import DeleteDialog from "src/components/core/DeleteDialog";
import TanStackTable from "src/components/core/TanstackTable";
import { SearchSvg } from "src/components/svg/SearchSvg";
import { Button } from "src/components/ui/button";
import { ApfcDevice } from "src/lib/interfaces/apfc";
import { addSerial } from "src/lib/services/addSerial";
import {
  deleteApfcAssignedUserAPI,
  deleteApfcDeviceAPI,
  getAllApfcDevicesAPI,
} from "src/lib/services/apfc";
import AddApfcDevice from "./add";
import { ApfcColumns } from "./ApfcColumns";

export function GetAllAPFCDevices() {
  const location = useLocation();
  const navigate = useNavigate();
  const { device_id } = useParams({ strict: false });
  const searchParams = new URLSearchParams(location.search);
  const pageParam = Number(searchParams.get("page")) || 1;
  const limitParam = Number(searchParams.get("limit")) || 10;
  const [pagination, setPagination] = useState({
    page: pageParam,
    limit: limitParam,
  });
  const [editState, setEditState] = useState<{
    isOpen: boolean;
    isEdit: boolean;
    device: ApfcDevice | null;
  }>({ isOpen: false, isEdit: false, device: null });
  const [searchString, setSearchString] = useState(
    searchParams.get("search_string") || ""
  );
  const [debounceSearchString, setDebounceSearchString] =
    useState(searchString);
  const [deleteDeviceObj, setDeleteDeviceObj] = useState<ApfcDevice | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [deleteUserObj, setDeleteUserObj] = useState<ApfcDevice | null>(null);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] =
    useState<boolean>(false);
  const [assignUserState, setAssignUserState] = useState<{
    isOpen: boolean;
    deviceId: string | null;
  }>({ isOpen: false, deviceId: null });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch: refetchDevices,
  } = useInfiniteQuery({
    queryKey: ["apfc", debounceSearchString, pagination],
    queryFn: async ({ pageParam = 1 }) => {
      const queryParams = {
        page: pageParam,
        limit: pagination.limit,
        ...(debounceSearchString && { search_string: debounceSearchString }),
      };

      navigate({
        to: location.pathname,
        search: {
          search_string: debounceSearchString || undefined,
          limit: pagination.limit,
          page: pageParam,
        },
        replace: true,
      });

      const response = await getAllApfcDevicesAPI(queryParams);
      const {
        data: apfcData,
        page,
        limit,
        total_pages,
        has_more,
      } = response?.data;
      return {
        data: addSerial(apfcData, pageParam, pagination.limit),
        pagination: {
          page,
          limit,
          total_pages,
          has_more,
        },
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.pagination) return undefined;
      if (
        lastPage.pagination.has_more &&
        lastPage.pagination.page < lastPage.pagination.total_pages
      ) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { mutate: deleteDevice, isPending: isDeletePending } = useMutation({
    mutationFn: (deviceId: number) => deleteApfcDeviceAPI(deviceId),
    onSuccess: (response) => {
      toast.success(response?.data?.message || "Device deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeleteDeviceObj(null);
      refetchDevices();
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to delete device");
    },
    retry: false,
  });

  const { mutate: unassignUser, isPending: isUnassignPending } = useMutation({
    mutationFn: (deviceId: number) => deleteApfcAssignedUserAPI(deviceId),
    onSuccess: (response: any) => {
      toast.success(response?.data?.message || "User unassigned successfully");
      setIsDeleteUserDialogOpen(false);
      setDeleteUserObj(null);
      refetchDevices();
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to unassign user");
    },
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceSearchString(searchString);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchString]);

  const deviceData = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastRowRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (isFetchingNextPage || !hasNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchNextPage();
          }
        },
        {
          root: document.querySelector(".scrollbar"),
          threshold: 0.5,
        }
      );
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const handleRowClick = (apfc: ApfcDevice) => {
    navigate({
      to: `/apfc/${apfc?.id}/details`,
    });
  };

  const handleEdit = (device: ApfcDevice) => {
    setEditState({
      isOpen: true,
      isEdit: true,
      device,
    });
  };

  const handleDelete = (deviceId: number) => {
    const device = deviceData.find((d) => d.id === deviceId);
    setDeleteDeviceObj(device || null);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteDeviceObj) {
      deleteDevice(deleteDeviceObj?.id);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDeleteDeviceObj(null);
  };

  const handleDeleteUser = (deviceId: number) => {
    const selectedDevice = deviceData?.find((d) => {
      return Number(d.id) === Number(deviceId);
    });

    if (!selectedDevice) {
      console.warn("No device found for id:", deviceId);
    } else {
    }

    setDeleteUserObj(selectedDevice || null);
    setIsDeleteUserDialogOpen(true);
  };
  const handleDeleteUserConfirm = () => {
    if (deleteUserObj) {
      unassignUser(deleteUserObj?.id);
    }
  };

  const handleDeleteUserCancel = () => {
    setIsDeleteUserDialogOpen(false);
    setDeleteUserObj(null);
  };

  const handleAssignUser = (deviceId: number) => {
    setAssignUserState({ isOpen: true, deviceId: deviceId.toString() });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebounceSearchString(searchString);
  };

  const handleResetEdit = (isEdit: boolean) => {
    setEditState((prev) => ({ ...prev, isEdit }));
  };

  return (
    <>
      <div className="w-full flex justify-between text-xs 3xl:text-sm">
        <div
          id="apfcTable"
          className="w-custom_37per p-4 space-y-4 bg-white border-r border-slate-200"
        >
          <div className="w-full">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-1.5 border border-slate-200 rounded-sm w-2/3 px-2">
                <SearchSvg />
                <input
                  placeholder="Search devices..."
                  className="outline-none h-9 bg-transparent w-full text-xs 3xl:text-sm"
                  type="search"
                  value={searchString}
                  onChange={(e) => setSearchString(e.target.value)}
                />
              </div>
            </form>
          </div>
          <div className="flex items-center justify-between">
            <div className="bg-primary/20 p-1 rounded-md w-fit">
              <Button
                onClick={() => navigate({ to: `/apfc` })}
                className={`text-xs 3xl:text-sm font-medium rounded-md px-3 py-1 h-auto ${location.pathname.includes("/apfc")
                    ? "bg-05A155 text-white hover:bg-05A155"
                    : "bg-transparent ring-0 text-black/60 hover:bg-transparent hover:text-black/80"
                  }`}
              >
                APFC
              </Button>
              <Button
                onClick={() => navigate({ to: `/devices` })}
                className={`text-xs 3xl:text-sm font-medium rounded-md px-3 py-1 h-auto ${location.pathname.includes("/devices")
                    ? "bg-05A155 text-white hover:bg-05A155"
                    : "bg-transparent ring-0 text-black/60 hover:bg-transparent hover:text-black/80"
                  }`}
              >
                Starter Box
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <AddApfcDevice
                isOpen={editState.isOpen}
                onOpenChange={(open: any) =>
                  setEditState({
                    isOpen: open,
                    isEdit: editState.isEdit,
                    device: editState.device,
                  })
                }
                isEdit={editState.isEdit}
                deviceData={editState.device}
                onResetEdit={handleResetEdit}
                refetchDevices={refetchDevices}
              />
            </div>
          </div>

          <TanStackTable
            columns={ApfcColumns({
              onEdit: handleEdit,
              onDelete: handleDelete,
              onView: handleRowClick,
              onAssignUser: handleAssignUser,
              onDeleteUser: handleDeleteUser,
            })}
            data={deviceData}
            loading={isFetching && !isFetchingNextPage}
            getData={refetchDevices}
            heightClass="h-apfc_devices"
            noDataLabel="No devices found"
            lastRowRef={lastRowRef}
            isFetchingNextPage={isFetchingNextPage}
            onRowClick={handleRowClick}
            removeSortingForColumnIds={[
              "serial",
              "device_name",
              "device_serial_number",
              "location_name",
              "user_full_name",
              "status",
              "actions",
            ]}
          />
        </div>
        <div className="w-custom_63per overflow-hidden relative">
          <Outlet />
        </div>
      </div>
      <DeleteDialog
        openOrNot={isDeleteDialogOpen}
        label={`Are you sure you want to delete ${deleteDeviceObj?.device_name || "this device"}?`}
        onCancelClick={handleDeleteCancel}
        onOKClick={handleDeleteConfirm}
        deleteLoading={isDeletePending}
        buttonLable="Yes! Delete"
        buttonLabling="Deleting..."
      />
      <DeleteDialog
        openOrNot={isDeleteUserDialogOpen}
        label={`Are you sure you want to unassign ${deleteUserObj?.user_full_name || "the user"} from ${deleteUserObj?.device_name || "this device"}?`}
        onCancelClick={handleDeleteUserCancel}
        onOKClick={handleDeleteUserConfirm}
        deleteLoading={isUnassignPending}
        buttonLable="Yes! Unassign"
        buttonLabling="Unassigning..."
      />
      <AssignUserDialog
        open={assignUserState.isOpen}
        onClose={() => setAssignUserState({ isOpen: false, deviceId: null })}
        getData={refetchDevices}
        devicesId={assignUserState.deviceId || ""}
      />
    </>
  );
}
