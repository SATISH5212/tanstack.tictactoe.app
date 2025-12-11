import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import dayjs from "dayjs";
import { LoaderCircle, SettingsIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { DateRangePicker } from "rsuite";
import { DeleteDeviceIcon } from "src/components/svg/DeletePond";
import { EditDeviceIcon } from "src/components/svg/EditDevice";
import { InfoDeviceIcon } from "src/components/svg/InfoIcon";
import { MenuIcon } from "src/components/svg/Menu icon";
import { NoDataDevice } from "src/components/svg/NoDataDeviceSvg";
import { Button } from "src/components/ui/button";
import { Checkbox } from "src/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import { capitalize } from "src/lib/helpers/capitalize";
import { DeviceLogs } from "../core/DeviceLogs";
import { SortItems } from "../core/TanstackTable";
import { GreenDot } from "../svg/GreenDot";
import { MotorSvg } from "../svg/MotorSvg";
import { PowerOff } from "../svg/PowerOff";
import { PowerOn } from "../svg/PowerOn";
import { RedDot } from "../svg/RedDot";
import { DeviceStatusFilterChange } from "./DeviceStatusFilter";
import { UserDeviceDetailsCard } from "./UserDeviceDetailsCard";
import ViewRawDataButton from "./ViewRawDataButton";

const UserDeviceComboxes = (props: any) => {
  const {
    isFetching,
    isFetchingNextPage,
    allDevices,
    lastRowRef,
    device_id,
    handleClick,
    setEditState,
    handleDelete,
    handleInfoDialogClick,
    setShowSettings,
    fetchNextPage,
    hasNextPage,
    handleSettingsClick,
    onSelectedIdsChange,
    selectedDeviceIds,
    handleExport,
    userGatewayId,
    refetch,
    onViewRawData,
    sortBy,
    setSortBy,
    sortType,
    setSortType,
    isExportLoading,
    devicesCount,
    setDeviceStatusFilter,
  } = props;

  const location = useLocation();
  const navigate = useNavigate();
  const { user_id } = useParams({ strict: false });
  const [selectMode, setSelectMode] = useState(false);
  const isApfcActive = location.pathname.toLowerCase().includes("/apfc");
  const [logsSheetOpen, setLogsSheetOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [selectedDeviceName, setSelectedDeviceName] = useState<any>(null);

  const handleSort = useCallback(
    (columnId: string) => {
      if (sortBy === columnId) {
        if (sortType === "asc") {
          setSortType("desc");
        } else if (sortType === "desc") {
          setSortBy("");
          setSortType("");
        } else {
          setSortType("asc");
        }
      } else {
        setSortBy(columnId);
        setSortType("asc");
      }
    },
    [sortBy, sortType, setSortBy, setSortType]
  );

  const handleApfcClick = useCallback(() => {
    navigate({ to: `/users/${user_id}/apfc` });
  }, [navigate, user_id]);

  const handleStarterBoxClick = useCallback(() => {
    navigate({ to: `/users/${user_id}/devices` });
  }, [navigate, user_id]);

  const handleCheckboxChange = useCallback(
    (deviceId: string, checked: boolean) => {
      const updatedIds = checked
        ? [...selectedDeviceIds, deviceId]
        : selectedDeviceIds.filter((id: any) => id !== deviceId);
      onSelectedIdsChange(updatedIds);
    },
    [selectedDeviceIds, onSelectedIdsChange]
  );

  const handleSelectAllChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        const allDeviceIds = allDevices.map((device: any) => device.id);
        onSelectedIdsChange(allDeviceIds);
      } else {
        onSelectedIdsChange([]);
      }
    },
    [allDevices, onSelectedIdsChange]
  );

  const handleViewRawData = useCallback(
    (device: any) => {
      navigate({
        to: `/users/${user_id}/devices/${device.id}`,
      });
    },
    [navigate, user_id]
  );
  const handleDateRangeChange = useCallback((value: [Date, Date] | null) => {
    setDateRange(value);
  }, []);

  const formatDate = (date: Date) => {
    return date.toISOString()?.split("T")[0];
  };

  const modifiedHandleExport = useCallback(() => {
    const queryParams: any = {
      starter_ids:
        selectedDeviceIds.length === allDevices.length
          ? "all"
          : selectedDeviceIds.join(","),

      ...(dateRange && {
        from_date: dayjs(dateRange[0])
          .tz("Asia/Kolkata")
          .startOf("day")
          .format("YYYY-MM-DD"),
        to_date: dayjs(dateRange[1])
          .tz("Asia/Kolkata")
          .endOf("day")
          .format("YYYY-MM-DD"),
      }),
    };

    handleExport(queryParams);
  }, [selectedDeviceIds, allDevices, dateRange, handleExport]);

  const isAllSelected =
    allDevices.length > 0 &&
    allDevices.every((device: any) => selectedDeviceIds.includes(device.id));
  const sortableColumns = ["title", "pcb_number"];
  const removeSortingForColumnIds = [
    "volts",
    "power",
    "m_state",
    "currents",
    "modes",
    "status",
    "alerts",
    "faults",
    "actions",
  ];
  const handleDeviceStatusChange = (status: string | null) => {
    setDeviceStatusFilter(status);
  };

  return (
    <div className="p-2 w-full box-border bg-white overflow-y-hidden">
      <div className="flex justify-between  items-center pr-4">
        <span className="bg-primary/20 p-1 rounded-md w-fit">
          <Button
            onClick={handleApfcClick}
            className={`text-xs 3xl:text-sm font-medium rounded-md px-3 py-1 h-auto ring-0 ${isApfcActive
                ? "!bg-05A155 !text-white !hover:bg-05A155"
                : "bg-transparent ring-0 text-black/60 hover:bg-transparent hover:text-black/80"
              }`}
          >
            APFC
          </Button>
          <Button
            onClick={handleStarterBoxClick}
            className={`text-xs 3xl:text-sm font-medium rounded-md px-3 py-1 h-auto ring-0 ${location.pathname.includes("/devices")
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-transparent text-black/60 hover:bg-transparent hover:text-black/80"
              }`}
          >
            Starter Box
          </Button>
        </span>
        <span>
          <span className="flex space-x-4 items-end text-xs font-normal text-black">
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
        </span>
      </div>
      <div className="flex justify-between w-full my-2">
        <div className="flex items-center gap-4">
          <Button
            className="border border-black bg-transparent text-black text-xs rounded h-auto px-2 py-[3px] hover:bg-transparent hover:text-black hover:border"
            onClick={() => {
              setSelectMode(!selectMode);
              onSelectedIdsChange([]);
              setDateRange(null);
            }}
          >
            {selectMode ? "Cancel" : "Select"}
          </Button>
          {selectMode && (
            <>
              <DateRangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                format="dd-MM-yyyy"
                placeholder="Select Date Range"
                className="text-[10px] w-[200px]"
                size="xs"
              />
              <Button
                onClick={modifiedHandleExport}
                disabled={selectedDeviceIds.length === 0}
                className="bg-[#FFAD00] hover:bg-[#FFAD00] text-white text-xs rounded h-auto px-2 py-1 flex items-center gap-2"
              >
                {isExportLoading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin text-white" />
                ) : (
                  "Export"
                )}
              </Button>
            </>
          )}
        </div>
        <div className="flex gap-3 justify-end items-center">
          <DeviceStatusFilterChange
            onStatusChange={handleDeviceStatusChange}
            disabled={!allDevices || allDevices.length === 0}
          />
          <UserDeviceDetailsCard refetch={refetch} />
        </div>
      </div>

      {selectMode && (
        <div className="flex items-center">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={handleSelectAllChange}
            onClick={(e) => e.stopPropagation()}
            className="mr-2"
          />
          <span className="text-xs 3xl:text-sm font-medium">Select All</span>
        </div>
      )}

      <div className="mt-2 h-[calc(100vh-180px)] overflow-auto">
        {isFetching && !allDevices.length && !isFetchingNextPage ? (
          <div className="p-4 w-full h-full box-border flex flex-col items-center justify-center text-center text-gray-500">
            <img src="/PeepulAgriLogo.svg" alt="Logo" className="w-32 h-32" />
          </div>
        ) : allDevices.length > 0 ? (
          <table className="w-full text-xs 3xl:text-sm relative bg-white">
            <thead className="bg-gray-100 text-7F899D sticky top-0 z-20">
              <tr className="font-inter px-2 py-1">
                <th
                  className={`p-2 text-left font-medium text-7F899D text-xs 3xl:text-sm sticky left-0 z-30 bg-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] cursor-pointer ${selectMode ? "min-w-[150px]" : "min-w-[100px]"
                    }`}
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center justify-between">
                    <span>Title</span>
                    <SortItems
                      header={{ id: "title" }}
                      removeSortingForColumnIds={removeSortingForColumnIds}
                      sortBy={sortBy}
                      sortType={sortType}
                    />
                  </div>
                </th>

                <th
                  className={`p-2 text-center font-medium text-7F899D text-xs 3xl:text-sm sticky z-30 bg-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[100px] cursor-pointer ${selectMode ? "left-[150px]" : "left-[100px]"
                    }`}
                  onClick={() => handleSort("pcb_number")}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>PCB No</span>
                    <SortItems
                      header={{ id: "pcb_number" }}
                      removeSortingForColumnIds={removeSortingForColumnIds}
                      sortBy={sortBy}
                      sortType={sortType}
                    />
                  </div>
                </th>
                <th className="p-2 text-center font-medium text-7F899D text-xs 3xl:text-sm min-w-[120px]">
                  Volts
                </th>
                <th className="p-2 text-center font-medium text-7F899D text-xs 3xl:text-sm min-w-[80px]">
                  Power
                </th>
                <th className="p-2 text-center font-medium text-7F899D text-xs 3xl:text-sm min-w-[100px]">
                  M-State
                </th>
                <th className="p-2 text-center font-medium text-7F899D text-xs 3xl:text-sm min-w-[100px]">
                  Currents
                </th>
                <th className="p-2 text-center font-medium text-7F899D text-xs 3xl:text-sm min-w-[120px]">
                  Modes
                </th>
                <th className="p-2 text-center font-medium text-7F899D text-xs 3xl:text-sm min-w-[120px]">
                  Status
                </th>
                <th className="p-2 text-center font-medium text-7F899D text-xs 3xl:text-sm min-w-[80px]">
                  Alerts
                </th>
                <th className="p-2 text-center font-medium text-7F899D text-xs 3xl:text-sm min-w-[80px]">
                  Faults
                </th>
                <th className="p-2 text-center font-medium text-7F899D text-xs 3xl:text-sm sticky right-0 z-30 bg-gray-100 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {allDevices?.map((device: any, index: number) => {
                const isLastRow = index === allDevices?.length - 1;
                const sortedMotors =
                  device?.starterBoxParameters?.length > 0
                    ? [...device?.starterBoxParameters].sort((a, b) => {
                      if (a?.motor_ref_id === "mtr_1") return -1;
                      if (b?.motor_ref_id === "mtr_1") return 1;
                      if (a?.motor_ref_id === "mtr_2") return -1;
                      return 0;
                    })
                    : [];

                return (
                  <tr
                    key={device?.id}
                    ref={isLastRow ? lastRowRef : null}
                    onClick={() => handleClick(device)}
                    className={`border-b border-gray-200 group ${device_id == device?.id
                        ? "bg-E4F5E3"
                        : "bg-white hover:bg-gray-50"
                      } cursor-pointer`}
                  >
                    <td
                      className={`p-2 h-12 sticky left-0 z-10 bg-inherit shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${selectMode ? "w-[150px]" : "w-[100px]"
                        } ${device_id == device?.id
                          ? "group bg-E4F5E3"
                          : "group-hover:bg-gray-50"
                        }`}
                    >
                      <span className="flex items-center gap-1 bg-inherit h-full w-full">
                        {selectMode && (
                          <div className="flex items-center">
                            <Checkbox
                              checked={selectedDeviceIds.includes(device?.id)}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(
                                  device?.id,
                                  checked === true
                                )
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="mr-2"
                            />
                          </div>
                        )}
                        <span title={device?.title}>
                          {device?.title
                            ? device?.title.length > 10
                              ? capitalize(device?.title.slice(0, 10)) + "..."
                              : capitalize(device?.title)
                            : "--"}
                        </span>
                      </span>
                    </td>
                    <td
                      className={`p-2 sticky z-10 bg-inherit shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-[100px] ${selectMode ? "left-[150px]" : "left-[100px]"
                        } ${device_id == device?.id
                          ? "group bg-E4F5E3"
                          : "group-hover:bg-gray-50"
                        }`}
                    >
                      <span className="flex items-center gap-1">
                        <span title={device?.pcb_number}>
                          {device?.pcb_number
                            ? device?.pcb_number.length > 10
                              ? capitalize(device?.pcb_number.slice(0, 10)) +
                              "..."
                              : capitalize(device?.pcb_number)
                            : "--"}
                        </span>
                      </span>
                    </td>
                    <td className="p-2 w-[120px] text-center">
                      {sortedMotors.length > 0 &&
                        sortedMotors[0]?.line_voltage_vry != null ? (
                        <span className="flex items-center gap-1 justify-center">
                          <span className="text-[11px] text-red-500 w-[30px]">
                            {sortedMotors[0].line_voltage_vry.toFixed(1) ??
                              "--"}
                          </span>
                          <span className="text-[11px] text-yellow-500 w-[30px]">
                            {sortedMotors[0].line_voltage_vyb.toFixed(1) ??
                              "--"}
                          </span>
                          <span className="text-[11px] text-blue-500 w-[30px]">
                            {sortedMotors[0].line_voltage_vbr.toFixed(1) ??
                              "--"}
                          </span>
                        </span>
                      ) : (
                        "--"
                      )}
                    </td>
                    <td className="p-2 w-[80px]">
                      <div className="flex items-center justify-center font-medium text-xxs 3xl:text-xs gap-1 px-2 py-1 rounded-full">
                        {sortedMotors.length > 0 &&
                          sortedMotors[0]?.power_present != null ? (
                          sortedMotors[0].power_present === "1" ? (
                            <PowerOn />
                          ) : (
                            <PowerOff />
                          )
                        ) : (
                          "--"
                        )}
                      </div>
                    </td>
                    <td className="p-2 w-[100px] text-center">
                      {sortedMotors.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {sortedMotors.map((motor: any) => (
                            <div
                              key={motor.id}
                              className="flex items-center gap-1 justify-center"
                            >
                              <span className="text-[11px] 3xl:!text-sm font-medium">
                                {motor.motor_ref_id === "mtr_1"
                                  ? "M1"
                                  : motor.motor_ref_id === "mtr_2"
                                    ? "M2"
                                    : "--"}
                                :
                              </span>
                              {motor.motor_state != null ? (
                                motor.motor_state === 0 ? (
                                  <RedDot />
                                ) : (
                                  <GreenDot />
                                )
                              ) : (
                                "--"
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        "--"
                      )}
                    </td>
                    <td className="p-2 w-[100px] text-center">
                      {sortedMotors.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {sortedMotors.map((motor: any) => (
                            <span
                              key={motor.id}
                              className="flex items-center gap-1 justify-center"
                            >
                              <span className="text-[11px] text-red-500 w-[30px]">
                                {motor.current_i1 != null
                                  ? motor.current_i1.toFixed(1)
                                  : "--"}
                              </span>
                              <span className="text-[11px] text-yellow-500 w-[30px]">
                                {motor.current_i2 != null
                                  ? motor.current_i2.toFixed(1)
                                  : "--"}
                              </span>
                              <span className="text-[11px] text-blue-500 w-[30px]">
                                {motor.current_i3 != null
                                  ? motor.current_i3.toFixed(1)
                                  : "--"}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        "--"
                      )}
                    </td>
                    <td className="p-2 text-[11px] text-center w-[120px]">
                      {sortedMotors.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {sortedMotors.map((motor: any) => (
                            <div key={motor.id}>
                              {motor?.motor_mode
                                ? capitalize(motor.motor_mode.toLowerCase())
                                : "--"}
                            </div>
                          ))}
                        </div>
                      ) : (
                        "--"
                      )}
                    </td>
                    <td className="p-2 text-center w-[80px]">
                      {device?.status ? (
                        <span
                          className={`text-[11px] ${device.status === "ACTIVE"
                              ? "text-green-500"
                              : "text-red-500"
                            }`}
                        >
                          {device.status === "ACTIVE" ? "Active" : "Inactive"}
                        </span>
                      ) : (
                        "--"
                      )}
                    </td>
                    <td className="p-2 text-center w-[80px]">
                      {device?.alert_count == null ? "--" : device?.alert_count}
                    </td>
                    <td className="p-2 text-center w-[80px]">
                      {device?.fault_count == null ? "--" : device?.fault_count}
                    </td>
                    <td
                      className={`p-2 sticky right-0 z-10 bg-inherit shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] ${device_id == device?.id
                          ? "group bg-E4F5E3"
                          : "group-hover:bg-gray-50"
                        }`}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MenuIcon />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-gray-500 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInfoDialogClick(device);
                            }}
                          >
                            <InfoDeviceIcon />
                            Info
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-gray-500 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSettingsClick(device);
                            }}
                          >
                            <SettingsIcon />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-gray-500 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditState({ isOpen: true, device });
                            }}
                          >
                            <EditDeviceIcon />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-gray-500 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(device);
                            }}
                          >
                            <DeleteDeviceIcon />
                            Delete
                          </DropdownMenuItem>
                          <ViewRawDataButton
                            device={device}
                            onOpenDrawer={() => {
                              if (onViewRawData) {
                                onViewRawData(device);
                              }
                            }}
                          />
                          <DropdownMenuItem
                            className="text-gray-500 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDeviceId(device?.id);
                              setSelectedDeviceName(device?.title);

                              setLogsSheetOpen(true);
                            }}
                          >
                            <MotorSvg />
                            Device Logs
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {selectedDeviceId && (
                        <DeviceLogs
                          motorId={selectedDeviceId}
                          devicename={selectedDeviceName}
                          open={logsSheetOpen}
                          setOpen={setLogsSheetOpen}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-4 w-full h-no_devices box-border flex flex-col items-center justify-center text-center text-gray-500">
            <NoDataDevice />
            <p className="mb-2 font-medium">No devices available</p>
          </div>
        )}

        {hasNextPage && !isFetchingNextPage && (
          <div className="p-4 text-center">
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="bg-05A155 text-white hover:bg-05A155/90"
            >
              Load More
            </Button>
          </div>
        )}

        {isFetchingNextPage && (
          <div className="sticky bottom-0 left-0 right-0 flex justify-center bg-white/95 backdrop-blur-sm border-t border-gray-200 py-4 z-30">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600 font-medium">
                Loading more devices...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDeviceComboxes;
