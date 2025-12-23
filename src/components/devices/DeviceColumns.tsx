import { useDeviceMutation } from "@/hooks/devices/useDeviceMutation";
import { capitalize } from "@/lib/helpers/capitalize";
import { useUserDetails } from "@/lib/helpers/userpermission";
import { DeviceColumnsProps } from "@/lib/interfaces/devices";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";

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
import { useState } from "react";



export const DeviceColumns = ({
  refetchDevices,
  setEditState,
  handleDelete,
  assignedMember,
}: DeviceColumnsProps): ColumnDef<any>[] => {
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
          <div className="p-1.5 h-8 flex items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap text-xs 3xl:text-sm text-left">
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
          <div className="w-full truncate p-1.5 h-8 flex items-center  justify-center overflow-hidden text-ellipsis whitespace-nowrap text-xs 3xl:text-sm text-left ">
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
          <div className="w-full flex items-center p-1.5 text-xs 3xl:text-sm text-left">
            <span
              title={value}
              className="break-all whitespace-normal leading-tight"
            >
              {value}
            </span>
          </div>
        );
      },
    },

    {
      accessorFn: (row: any) => row.starterBoxParameters?.[0]?.power_present,
      id: "power_present",
      cell: (info: any) => {
        const powerPresent = info.getValue();
        return (
          <div className="p-1.5 h-8 items-center overflow-hidden text-ellipsis whitespace-nowrap text-xs 3xl:text-sm flex justify-center">
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
          <div className="p-1 h-8 text-xs 3xl:text-sm text-center leading-tight flex flex-col gap-0.5 justify-center items-center">
            {params.length > 0 ? (
              <div className="flex flex-col items-center gap-0.5">
                {voltages && (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex gap-1 items-center">
                      <div className="text-red-500 text-[10px]">V</div>
                      <div className="text-red-500 w-[28px] text-center text-[10px]">
                        {voltages?.line_voltage_b?.toFixed(1) || 0}
                      </div>
                      <div className="text-yellow-500 w-[28px] text-center text-[10px]">
                        {voltages?.line_voltage_r?.toFixed(1) || 0}
                      </div>
                      <div className="text-blue-500 w-[28px] text-center text-[10px]">
                        {voltages?.line_voltage_y?.toFixed(1) || 0}
                      </div>
                    </div>

                    <div className="flex gap-1 items-center">
                      <div className="text-blue-500 text-[10px]">
                        A
                      </div>
                      <div className="text-red-500 w-[28px] text-center text-[10px]">
                        {voltages?.current_b?.toFixed(1) || 0}
                      </div>
                      <div className="text-yellow-500 w-[28px] text-center text-[10px]">
                        {voltages?.current_r?.toFixed(1) || 0}
                      </div>
                      <div className="text-blue-500 w-[28px] text-center text-[10px]">
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
          <div className="p-1.5 h-8 justify-center text-xs 3xl:text-sm text-center leading-tight flex flex-col gap-0.5 items-center">
            {params.length > 0 ? (
              <div className="flex flex-col items-center gap-0.5">
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
            <div className="p-1.5 h-8 flex items-center justify-center text-xs 3xl:text-sm">
              --
            </div>
          );
        }

        return (
          <div className="p-1.5 h-8 flex items-center justify-center gap-2 text-xs 3xl:text-sm">
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
          <div
            className={`p-0 h-8 justify-center text-xs 3xl:text-sm text-center leading-tight flex flex-col items-center`}
          >
            {device ? (
              <div className={`flex items-center gap-1 ${mode_value === "AUTO" && "text-orange-500"}`}>
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
      accessorFn: (row: any) => row,
      id: "user",
      cell: (info: any) => {
        const username = info.row.original || "--";
        return (
          <div className="p-1.5 h-8 justify-center flex items-center overflow-hidden text-ellipsis whitespace-nowrap text-xs 3xl:text-sm text-center">
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
          <div className="p-1.5 h-8 justify-center flex items-center overflow-hidden text-ellipsis whitespace-nowrap text-xs 3xl:text-sm text-center">
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
        const [dialogOpen, setDialogOpen] = useState(false);
        const [isLoading, setIsLoading] = useState(false);
        const [assignDialogOpen, setAssignDialogOpen] = useState(false);
        const { updateDeviceStatusMutation } = useDeviceMutation();

        const assignedUser = info.row.original.user
          ? assignedMember?.find(
            (user: any) => user.id === info.row.original.user.id
          )
          : null;

        const handleStatusChange = (newStatus: string) => {
          if (newStatus === "DEPLOYED") {
            setDialogOpen(true);
            return;
          }
          updateDeviceStatusMutation.mutate({ deviceId, status: newStatus, },
            {
              onSettled: () => {
                refetchDevices();
              },
            });
        };



        const handleAssignUser = () => {
          setAssignDialogOpen(true);
        };

        return (
          <div
            className="p-1.5 h-8 flex justify-center items-center overflow-hidden text-ellipsis whitespace-nowrap text-xs 3xl:text-sm"
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

                            updateDeviceStatusMutation.mutate(
                              { deviceId, status: "DEPLOYED" },
                              {
                                onSettled: () => {
                                  setIsLoading(false);
                                  setDialogOpen(false);
                                  refetchDevices();
                                },
                              }
                            );
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
      id: "actions",
      header: () => (
        <span className="text-center w-full block  z-11">Actions</span>
      ),
      cell: (info: any) => (
        <div
          className="w-full flex justify-center p-1.5 z-10"        >
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

// import { useLocation, useRouter } from "@tanstack/react-router";
// import {
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getSortedRowModel,
//   Header,
//   SortingState,
//   useReactTable,
// } from "@tanstack/react-table";
// import { FC, useState } from "react";
// import { NoDataDevice } from "../svg/NoDataDeviceSvg";
// import { NoUsersDataSvg } from "../svg/NoUsersDataSvg";
// import { SortAscIcon } from "../svg/SortAscIcon";
// import { SortDescIcon } from "../svg/SortDescIcon";
// import { SortIcon } from "../svg/SortIcon";
// import { Skeleton } from "../ui/skeleton";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "../ui/table";

// const TanStackTable: FC<any> = ({
//   columns,
//   data,
//   loading = false,
//   getData,
//   removeSortingForColumnIds,
//   noDataLabel,
//   lastRowRef,
//   isFetchingNextPage,
//   onRowClick,
//   sortBy,
//   sortType,
//   setSortBy,
//   setSortType,
//   isSelectedId,
// }: any) => {
//   console.log(isSelectedId, "devdevw")
//   const router = useRouter();
//   const location = useLocation();

//   const [sorting, setSorting] = useState<SortingState>([
//     { id: sortBy, desc: sortType === "desc" },
//   ]);

//   const searchParams = new URLSearchParams(location?.search);

//   const table = useReactTable({
//     columns,
//     data: data?.length ? data : [],
//     state: { sorting },
//     onSortingChange: (updater) => {
//       setSorting(updater);
//       const next =
//         typeof updater === "function" ? updater(sorting) : updater;

//       if (next.length) {
//         setSortBy(next[0].id);
//         setSortType(next[0].desc ? "desc" : "asc");
//       } else {
//         setSortBy("");
//         setSortType("");
//       }
//     },
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//   });

//   const getWidth = (id: string) => {
//     const col = columns.find((c: any) => c.id === id);
//     return col?.width || col?.size || "120px";
//   };

//   const sortAndGetData = (header: Header<any, unknown>) => {
//     if (removeSortingForColumnIds?.includes(header.id)) return;

//     let nextSortBy = header.id;
//     let nextSortType = "asc";

//     if (sortBy === header.id) {
//       if (sortType === "asc") nextSortType = "desc";
//       else {
//         nextSortBy = "";
//         nextSortType = "";
//       }
//     }

//     setSorting(
//       nextSortBy ? [{ id: nextSortBy, desc: nextSortType === "desc" }] : []
//     );

//     setSortBy(nextSortBy);
//     setSortType(nextSortType);

//     getData({
//       ...Object.fromEntries(searchParams),
//       pageIndex: Number(searchParams.get("current_page")) || 1,
//       page_size: Number(searchParams.get("page_size")) || 25,
//       sort_by: nextSortBy || undefined,
//       sort_type: nextSortType || undefined,
//     });
//   };

//   return (
//     <div className="w-full h-full flex flex-col">
//       {!data.length && !loading ? (
//         <div className="h-full flex flex-col items-center justify-center text-gray-500">
//           {location.pathname.startsWith("/devices") ? (
//             <>
//               <NoDataDevice />
//               <p className="mt-2">
//                 {noDataLabel || "No devices available"}
//               </p>
//             </>
//           ) : (
//             <>
//               <NoUsersDataSvg />
//               <p className="mt-2">
//                 {noDataLabel || "No users found"}
//               </p>
//             </>
//           )}
//         </div>
//       ) : (
//         <>
//           <div className="flex-1 overflow-auto ">
//             <Table className="w-full table-fixed overflow-y-auto !h-full ">
//               <TableHeader className="bg-[#eef5f8] sticky top-0 z-10">
//                 {table.getHeaderGroups().map((group) => (
//                   <TableRow key={group.id}>
//                     {group.headers.map((header, index) => (
//                       <TableHead
//                         key={header.id}
//                         className="text-xs font-normal h-8"
//                         style={{
//                           width: getWidth(header.id),
//                           minWidth: getWidth(header.id),
//                         }}
//                       >
//                         {!header.isPlaceholder && (
//                           <div
//                             onClick={() => sortAndGetData(header)}
//                             className={`flex items-center gap-1 ${header.column.getCanSort()
//                               ? "cursor-pointer select-none"
//                               : ""
//                               }`}
//                           >
//                             {flexRender(
//                               header.column.columnDef.header,
//                               header.getContext()
//                             )}
//                             <SortItems
//                               header={header}
//                               removeSortingForColumnIds={
//                                 removeSortingForColumnIds
//                               }
//                               sortBy={sortBy}
//                               sortType={sortType}
//                             />
//                           </div>
//                         )}
//                       </TableHead>
//                     ))}
//                   </TableRow>
//                 ))}
//               </TableHeader>
//               <TableBody>
//                 {loading && !isFetchingNextPage ? (
//                   [...Array(13)].map((_, i) => (
//                     <TableRow key={i} className="h-8">
//                       {columns.map((_: any, j: number) => (
//                         <TableCell key={j} className="!p-1">
//                           <Skeleton className="h-5 w-3/5" />
//                         </TableCell>
//                       ))}
//                     </TableRow>
//                   ))
//                 ) : (
//                   table.getRowModel().rows.map((row: any, index) => {
//                     const isLast =
//                       index === table.getRowModel().rows.length - 1;
//                     return (
//                       <TableRow
//                         key={row.id}
//                         ref={isLast ? lastRowRef : null}
//                         onClick={() => onRowClick?.(row.original)}
//                         className={`hover:bg-[#eef5f8] cursor-pointer h-8 ${isSelectedId == row?.original?.id && "bg-[#eef5f8]"}`}
//                       >
//                         {row.getVisibleCells().map((cell: any) => (
//                           <TableCell
//                             key={cell.id}
//                             className="!p-1"
//                             style={{
//                               width: getWidth(cell.column.id),
//                               minWidth: getWidth(cell.column.id),
//                             }}
//                           >
//                             {flexRender(
//                               cell.column.columnDef.cell,
//                               cell.getContext()
//                             )}
//                           </TableCell>
//                         ))}
//                       </TableRow>
//                     );
//                   })
//                 )}
//               </TableBody>
//             </Table>
//           </div>

//           {isFetchingNextPage && (
//             <div className="bg-white border-t py-3 flex justify-center items-center gap-2">
//               <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
//               <span className="text-sm text-gray-600">Loading more devices…</span>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default TanStackTable;

// export const SortItems = ({
//   header,
//   removeSortingForColumnIds,
//   sortBy,
//   sortType,
// }: {
//   header: any;
//   removeSortingForColumnIds?: string[];
//   sortBy: string;
//   sortType: string;
// }) => {
//   if (removeSortingForColumnIds?.includes(header.id)) return null;

//   if (sortBy !== header.id) return <SortIcon />;
//   return sortType === "asc" ? <SortAscIcon /> : <SortDescIcon />;
// };