import Tabs from "src/components/core/Tabs";
import { Button } from "src/components/ui/button";
import { capitalize } from "src/lib/helpers/capitalize";
import { getSingleUserApfcAPI } from "src/lib/services/apfc";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import AddApfcDevice from "./add";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import { MenuIcon } from "src/components/svg/Menu icon";
import { EditDeviceIcon } from "src/components/svg/EditDevice";
import { DeleteDeviceIcon } from "src/components/svg/DeletePond";
import { PondLocationIcon } from "@/components/svg/PondLocationIcon";
const UserBasedApfcDevices = () => {
  const { user_id } = useParams({ strict: false });
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const [searchString, setSearchString] = useState<any>(
    searchParams.get("search_starter_box") || ""
  );
  const [noDeviceData, setNoDeviceData] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [debounceSearchString, setDebounceSearchString] =
    useState(searchString);
  const [editState, setEditState] = useState<{
    isOpen: boolean;
    isEdit: boolean;
    device: any | null;
  }>({ isOpen: false, isEdit: false, device: null });
  const {
    data: apfcData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch: refetchUserBasedApfcDevices,
  } = useInfiniteQuery({
    queryKey: ["singleuserapfc", user_id, debounceSearchString],
    queryFn: async ({ pageParam = 1 }) => {
      let queryParams: any = {
        web: true,
      };
      const response = await getSingleUserApfcAPI(
        queryParams,
        user_id as string
      );
      const devices = response?.data?.data || [];
      const pagination = response?.data?.data?.pagination || {
        current_page: pageParam,
        total_pages: 1,
        page_size: 15,
      };
      if (devices.length === 0) {
        setNoDeviceData(true);
      } else {
        setNoDeviceData(false);
      }
      return { data: devices, pagination };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      if (!lastPage.pagination) return undefined;
      if (lastPage.pagination.current_page < lastPage.pagination.total_pages) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
    enabled: !!user_id,
    refetchOnWindowFocus: false,
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
  const allDevices = apfcData?.pages.flatMap((page) => page.data) || [];
  const handleNavigation = (apfc: any) => {
    navigate({ to: `/users/${user_id}/apfc/${apfc?.id}/details` });
  };
  const handleApfcClick = () => {
    navigate({ to: `/users/${user_id}/apfc` });
  };
  const handleStarterBoxClick = () => {
    navigate({ to: `/users/${user_id}/devices` });
  };
  useEffect(() => {
    if (allDevices.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(allDevices[0]?.id);
    }
  }, [apfcData, selectedDeviceId]);
  const handleAddDevice = () => {
    setEditState({ isOpen: true, isEdit: false, device: null });
  };
  const handleResetEdit = (isEdit: boolean) => {
    setEditState((prev) => ({ ...prev, isEdit }));
  };
  return (
    <div className="w-full flex bg-white h-user_devices overflow-y-auto border-l">
      <div className="w-custom_45per flex flex-col border-x">
        <div className="flex items-center justify-between">
          <Tabs
            searchString={searchString}
            setSearchString={setSearchString}
            title="Search Devices"
          />
        </div>
        <div className="p-4 space-y-2">
          <div className="bg-primary/20 p-1 rounded-md w-fit">
            <Button
              onClick={handleApfcClick}
              className={`text-xs 3xl:text-sm font-medium rounded-md px-3 py-1 h-auto ${
                location.pathname.includes("/apfc")
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-transparent ring-0 text-black/60 hover:bg-transparent hover:text-black/80"
              }`}
            >
              APFC
            </Button>
            <Button
              onClick={handleStarterBoxClick}
              className={`text-xs 3xl:text-sm font-medium rounded-md px-3 py-1 h-auto ${
                location.pathname.includes("/devices")
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-transparent ring-0 text-black/60 hover:bg-transparent hover:text-black/80"
              }`}
            >
              Starter Box
            </Button>
          </div>
          <div>
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
              refetchDevices={refetchUserBasedApfcDevices}
            />
          </div>
          <div className="space-y-2 overflow-auto h-apfc_devices font-inter pt-2">
            {allDevices?.map((apfc, index) => {
              const isLastItem = index === allDevices?.length - 1;
              return (
                <div
                  key={apfc?.id || index}
                  ref={isLastItem ? lastRowRef : null}
                  className="flex items-center py-1 px-2 bg-gray-50 border border-DBDEEB rounded-md cursor-pointer"
                  onClick={() => handleNavigation(apfc)}
                >
                  <span className="w-2/5">
                    <span
                      title={apfc?.device_serial_number}
                      className="block text-xxs 2xl:text-xs 3xl:text-sm text-05A155 mb-1"
                    >
                      {apfc?.device_serial_number?.slice(0, 10)}
                      {apfc?.device_serial_number?.length > 10 ? "..." : ""}
                    </span>
                    <span
                      title={apfc?.device_name}
                      className="block text-xxs 2xl:text-xs 3xl:text-sm text-black/90"
                    >
                      {apfc?.device_name?.slice(0, 10)}
                      {apfc?.device_name?.length > 10 ? "..." : ""}
                    </span>
                  </span>
                  <span className="w-2/5 text-xxs 2xl:text-xs 3xl:text-sm text-black/90 flex items-center gap-1">
                    <PondLocationIcon />
                    {apfc?.location_name ? (
                      <span title={apfc?.location_name}>
                        {apfc?.location_name?.slice(0, 10)}
                        {apfc?.location_name?.length > 10 ? "..." : ""}
                      </span>
                    ) : (
                      "--"
                    )}
                  </span>
                  <span className="w-1/5 flex justify-end">
                    <span
                      className={`flex items-center gap-1 rounded-2xl py-1 px-2 ${
                        apfc?.status === "ACTIVE"
                          ? "text-green-500 bg-green-100"
                          : "text-red-500 bg-red-100"
                      }`}
                    >
                      <div
                        className={`size-1.5 rounded-full ${
                          apfc?.status === "ACTIVE"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      {apfc?.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MenuIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-gray-500"
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditState({
                            isOpen: true,
                            isEdit: true,
                            device: apfc,
                          });
                        }}
                      >
                        <EditDeviceIcon />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-gray-500"
                        // onClick={() => handleDelete(apfc)}
                      >
                        <DeleteDeviceIcon />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
            {noDeviceData && <p className="p-2">No devices found.</p>}
            {(isFetching || isFetchingNextPage) && (
              <p className="p-2">Loading...</p>
            )}
          </div>
        </div>
      </div>
      <div className="w-custom_55per p-3 box-border relative">
        <Outlet />
      </div>
    </div>
  );
};
export default UserBasedApfcDevices;
