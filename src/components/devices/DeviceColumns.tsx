import { capitalize } from "@/lib/helpers/capitalize";
import { useUserDetails } from "@/lib/helpers/userpermission";
import { updateDeviceStatusAPI } from "@/lib/services/deviceses";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import AddIcon from "../icons/device/AddIcon";
import DeviceSignalIcon from "../icons/device/DevicesignalIcon";
import { DeleteDeviceIcon } from "../svg/DeletePond";
import { EditDeviceIcon } from "../svg/EditDevice";
import { MenuIcon } from "../svg/Menu icon";
import { PowerOff } from "../svg/PowerOff";
import { PowerOn } from "../svg/PowerOn";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import AssignUserToDevice from "./AssignUserToDevice";

interface DeviceColumnsProps {
  refetchDevices: () => void;
  setEditState: (state: { isOpen: boolean; device: any | null }) => void;
  handleDelete: (device: any) => void;
  debounceSearchString?: string;
  pageSize?: number;
  assignedMember: any;
}

export const DeviceColumns = ({
  refetchDevices,
  setEditState,
  handleDelete,
  debounceSearchString,
  assignedMember,
  pageSize,
}: DeviceColumnsProps): ColumnDef<any>[] => {
  const [logsSheetOpen, setLogsSheetOpen] = useState(false);
  const { isAdmin, isOwner } = useUserDetails();
  return [
    {
      accessorFn: (row: any) =>
        isAdmin()
          ? row.name
          : row.alias_starter_title != null
            ? row.alias_starter_title
            : row.name,
      id: "name",
      cell: (info: any) => {
        const title = info.getValue() || "-";
        const formattedTitle =
          title !== "-"
            ? title.charAt(0).toUpperCase() + title.slice(1).toLowerCase()
            : title;
        const displayText =
          formattedTitle?.length > 15
            ? `${formattedTitle.slice(0, 12)}...`
            : formattedTitle;

        return (
          <div className="p-2 h-10 flex items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap text-xs 3xl:text-sm text-left bg-white">
            <span title={title}>{displayText}</span>
          </div>
        );
      },
      header: () => <span className=" w-full block ">Device Name</span>,
      footer: (props: any) => props.column.id,
      size: 100,
    },
    {
      accessorFn: (row: any) => row.pcb_number,
      id: "pcb_number",
      cell: (info: any) => {
        const value = info.getValue() || "-";
        const displayText =
          value?.length > 15 ? `${value.slice(0, 12)}...` : value;

        return (
          <div className="w-full truncate p-2 h-[40px] flex items-center bg-white justify-center overflow-hidden text-ellipsis whitespace-nowrap text-xs 3xl:text-sm text-left ">
            <span title={value}>{displayText}</span>
          </div>
        );
      },
      header: () => <span className="!text-left w-full pl-3">PCB Number</span>,
      footer: (props: any) => props.column.id,
      size: 110,
    },
    {
      accessorFn: (row: any) => row.mac_address,
      id: "mac_address",
      cell: (info: any) => {
        const value = info.getValue() || "-";

        return (
          <div className="w-full h-10 justify-center items-center flex truncate p-2 overflow-hidden text-ellipsis whitespace-nowrap text-xs 3xl:text-sm text-left">
            <span>{value}</span>
          </div>
        );
      },
      header: () => (
        <span className=" w-full  h-10 flex items-center justify-center pl-10">
          MAC Address
        </span>
      ),
      footer: (props: any) => props.column.id,
      size: 150,
    },
    {
      accessorFn: (row: any) => row,
      id: "user",
      cell: (info: any) => {
        const username = info.row.original || "--";
        return (
          <div className="p-2 h-10 justify-center flex items-center overflow-hidden text-ellipsis whitespace-nowrap text-xs 3xl:text-sm text-center">
            {username?.user?.full_name || "--"}
          </div>
        );
      },
      header: () => (
        <span className="text-center w-full cursor-default pl-4">User</span>
      ),
      footer: (props: any) => props.column.id,
      size: 100,
    },
    {
      accessorFn: (row: any) => row,
      id: "location",
      cell: (info: any) => {
        const location = info.getValue() || "--";
        return (
          <div className="p-2 h-10 justify-center flex items-center overflow-hidden text-ellipsis whitespace-nowrap text-xs 3xl:text-sm text-center">
            {location?.motors[0]?.location?.name || "--"}
          </div>
        );
      },
      header: () => (
        <span className="text-center w-full cursor-default">Location</span>
      ),
      footer: (props: any) => props.column.id,
      size: 100,
    },
    {
      accessorFn: (row: any) => row.device_status,
      id: "device_status",
      cell: (info: any) => {
        const status = info.getValue() || "--";
        const deviceId = info.row.original.id;
        const [open, setOpen] = useState(false);
        const [dialogOpen, setDialogOpen] = useState(false);
        const [isLoading, setIsLoading] = useState(false);
        const [assignDialogOpen, setAssignDialogOpen] = useState(false);

        const queryClient = useQueryClient();

        const { mutate: updateStatus } = useMutation({
          mutationFn: (newStatus: string) =>
            updateDeviceStatusAPI(deviceId, { device_status: newStatus }),
          onSuccess: (response, newStatus) => {
            if (response.status === 200 || response.status === 201) {
              toast.success(response?.data?.message);
              queryClient.setQueryData(
                ["devices", debounceSearchString, pageSize],
                (oldData: any) => {
                  if (!oldData) return oldData;
                  return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => ({
                      ...page,
                      data: page.data.map((device: any) =>
                        device.id === deviceId
                          ? { ...device, device_status: newStatus }
                          : device
                      ),
                    })),
                  };
                }
              );
              refetchDevices();
            }
          },
          onError: (error: any) => {
            toast.error(error?.data?.message || "Failed to update status");
          },
          onSettled: () => {
            setIsLoading(false);
            setDialogOpen(false);
          },
        });

        const assignedUser = info.row.original.user
          ? assignedMember?.find(
            (user: any) => user.id === info.row.original.user.id
          )
          : null;

        const handleStatusChange = (newStatus: string) => {
          if (newStatus === "DEPLOYED") {
            setDialogOpen(true);
          } else {
            updateStatus(newStatus);
            setOpen(false);
          }
        };

        const handleAssignUser = () => {
          setAssignDialogOpen(true);
        };

        return (
          <div
            className="p-2 h-10 flex justify-center items-center overflow-hidden text-ellipsis whitespace-nowrap text-xs 3xl:text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {status === "ASSIGNED" ? (
              <div
                className="flex items-center justify-center gap-2"
                key={deviceId}
              >
                <Badge className="px-1 py-0.5 border border-gray-200 rounded-md bg-gray-500 text-white text-2xs font-normal hover:bg-gray-500 cursor-not-allowed">
                  Assigned
                </Badge>
                {assignedUser && (
                  <div className="bg-[#B0C4DE] w-6 h-6 rounded-full flex items-center justify-center overflow-hidden">
                    <p title={assignedUser.full_name || "--"}>
                      {assignedUser.full_name
                        ? assignedUser.full_name
                          ?.split(" ")
                          .slice(0, 2)
                          .map((name: string) => name.charAt(0))
                          .join("")
                          .toUpperCase()
                        : "--"}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Select
                  value={status !== "--" ? status : ""}
                  onValueChange={(value) => handleStatusChange(value)}
                >
                  <SelectTrigger
                    className={`w-fit px-1 py-0 h-6 border border-gray-200 rounded-md text-2xs font-normal cursor-pointer 
                    ${status === "READY"
                        ? "bg-green-500 text-white"
                        : status === "TEST"
                          ? "bg-yellow-400 text-white"
                          : status === "DEPLOYED"
                            ? "bg-cyan-500 text-white"
                            : "bg-gray-300 text-white"
                      }`}
                  >
                    <SelectValue placeholder="Select Status">
                      {status !== "--"
                        ? status === "TEST"
                          ? "Testing"
                          : status === "DEPLOYED"
                            ? "Deployable"
                            : capitalize(status.toLowerCase())
                        : "Select Status"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {status === "READY" && (
                      <SelectItem
                        value="TEST"
                        className="text-xs cursor-pointer hover:bg-gray-200"
                      >
                        Testing
                      </SelectItem>
                    )}
                    {status === "TEST" && (
                      <SelectItem
                        value="DEPLOYED"
                        className="text-xs cursor-pointer hover:bg-gray-200"
                      >
                        Deployable
                      </SelectItem>
                    )}
                    {status === "DEPLOYED" && (
                      <SelectItem
                        value="TEST"
                        className="text-xs cursor-pointer hover:bg-gray-200"
                      >
                        Testing
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {status === "DEPLOYED" && (
                  <AddIcon
                    className="size-4 cursor-pointer ml-2"
                    onClick={(e: any) => {
                      e.stopPropagation();
                      handleAssignUser();
                    }}
                  />
                )}
                <div className="bg-white">
                  <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <AlertDialogContent className="bg-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm font-bold">
                          Confirm Device Deploy
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-normal">
                          Are you sure you want to Deploy this device?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 hover:bg-red-500 text-white h-8 font-normal"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsLoading(true);
                            updateStatus("DEPLOYED");
                          }}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-white" />
                              Confirming...
                            </div>
                          ) : (
                            "Confirm"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <AssignUserToDevice
                    open={assignDialogOpen}
                    onClose={() => {
                      setAssignDialogOpen(false);
                    }}
                    getData={refetchDevices}
                    device_id={deviceId}
                    deviceData={info.row.original}
                  />
                </div>
              </>
            )}
          </div>
        );
      },
      header: () => (
        <span className="text-left w-full cursor-default ">
          Deployment Status
        </span>
      ),
      footer: (props: any) => props.column.id,
      size: 110,
    },
    {
      accessorFn: (row: any) => row.starterBoxParameters?.[0]?.power_present,
      id: "power_present",
      cell: (info: any) => {
        const powerPresent = info.getValue();
        return (
          <div className="p-2 h-10 items-center overflow-hidden text-ellipsis whitespace-nowrap text-xs 3xl:text-sm flex justify-center">
            <span>{powerPresent === "1" ? <PowerOn /> : <PowerOff />}</span>
          </div>
        );
      },
      header: () => (
        <span className="text-center w-full cursor-default">Power</span>
      ),
      footer: (props: any) => props.column.id,
      size: 50,
    },
    {
      accessorFn: (row: any) => row.motors?.[0]?.starterParameters ?? [],
      id: "voltage_current",
      cell: (info: any) => {
        const params = info.getValue() || [];

        const device = info.row.original;

        const voltages = device.motors?.[0]?.starterParameters?.[0] || {};

        return (
          <div className="p-2 h-10 text-xs 3xl:text-sm text-center leading-tight flex flex-col gap-1 justify-center items-center">
            {params.length > 0 ? (
              <div className="flex flex-col items-center gap-1">
                {voltages && (
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1">
                      <div className="text-red-500">
                        V
                      </div>
                      <div className="text-red-500 w-[32px] text-center">
                        {voltages?.line_voltage_b?.toFixed(1) || 0}
                      </div>
                      <div className="text-yellow-500 w-[32px] text-center">
                        {voltages?.line_voltage_r?.toFixed(1) || 0}
                      </div>
                      <div className="text-blue-500 w-[32px] text-center">
                        {voltages?.line_voltage_y?.toFixed(1) || 0}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <div className="text-blue-500">
                        A
                      </div>
                      <div className="text-red-500 w-[32px] text-center">
                        {voltages?.current_b?.toFixed(1) || 0}
                      </div>
                      <div className="text-yellow-500 w-[32px] text-center">
                        {voltages?.current_r?.toFixed(1) || 0}
                      </div>
                      <div className="text-blue-500 w-[32px] text-center">
                        {voltages?.current_y?.toFixed(1) || 0}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              "--"
            )}
          </div>
        );
      },
      header: () => (
        <span className="text-center w-full cursor-default">
          Voltage & Current
        </span>
      ),
      footer: (props: any) => props.column.id,
      size: 150,
    },
    {
      accessorFn: (row: any) => row.motors,
      id: "state",
      cell: (info: any) => {
        const params = info.getValue() || [];
        const device = info.row.original;
        const state_value = device?.motors?.[0]?.state;

        return (
          <div className="p-2 h-10 justify-center text-xs 3xl:text-sm text-center leading-tight flex flex-col gap-1 items-center">
            {params.length > 0 ? (
              <div className="flex flex-col items-center gap-1">
                {device && (
                  <div className="flex items-center gap-1">
                    {state_value === 1 ? <span className="text-green-500">ON</span> : <span className="text-red-500">OFF</span>}
                  </div>
                )}
              </div>
            ) : (
              "--"
            )}
          </div>
        );
      },
      header: () => (
        <span className="text-center w-full cursor-default">State</span>
      ),
      footer: (props: any) => props.column.id,
      size: 100,
    },
    {
      id: "signal_quality",
      accessorFn: (row: any) => row?.signal_quality,
      cell: ({ row }: any) => {
        const signalValue = row?.original?.signal_quality;

        if (!signalValue && signalValue !== 0) {
          return (
            <div className="p-2 h-10 flex items-center justify-center text-xs 3xl:text-sm">
              --
            </div>
          );
        }

        return (
          <div className="p-2 h-10 flex items-center justify-center gap-2 text-xs 3xl:text-sm">
            <DeviceSignalIcon strength={Number(signalValue)} />
          </div>
        );
      },
      header: () => (
        <span className="text-center w-full cursor-default">Signal</span>
      ),
      footer: (props: any) => props.column.id,
      size: 100,
    },

    {
      accessorFn: (row: any) => {
        row.motors;
      },
      id: "mode",
      cell: (info: any) => {
        const device = info.row.original;
        const mode_value = device?.motors?.[0]?.mode;
        return (
          <div className={`p-0 h-10 justify-center text-xs 3xl:text-sm text-center leading-tight flex flex-col items-center text-blue-500
            ${mode_value === "AUTO" && "text-orange-500"}
          `}>
            {device ? (
              <div className="flex items-center gap-1">
                <span>
                  {mode_value ? capitalize(mode_value.toLowerCase()) : "--"}
                </span>
              </div>
            ) : (
              "--"
            )}
          </div>
        );
      },
      header: () => (
        <span className="text-center w-full cursor-default">Mode</span>
      ),
      footer: (props: any) => props.column.id,
      size: 100,
    },

    {
      id: "actions",
      header: () => (
        <span className="text-center w-full block  z-11">Actions</span>
      ),
      cell: (info: any) => (
        <div
          className="w-full flex justify-center p-2 z-10"
          style={{
            position: "sticky",
            right: 0,
            zIndex: 10,
            background: "white",
          }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MenuIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">


              {isAdmin() && (
                <>
                  <DropdownMenuItem
                    className="text-gray-500 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditState({ isOpen: true, device: info.row.original });
                    }}
                  >
                    <EditDeviceIcon />
                    Edit
                  </DropdownMenuItem>
                </>
              )}
              {(isOwner() || isAdmin()) && (
                <DropdownMenuItem
                  className="text-gray-500 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(info.row.original);
                  }}
                >
                  <DeleteDeviceIcon />
                  Delete
                </DropdownMenuItem>
              )}

            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      size: 80,
    },
  ];
};
