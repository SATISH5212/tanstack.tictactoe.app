import { ColumnDef } from "@tanstack/react-table";
import { ApfcDevice } from "src/lib/interfaces/apfc";
import { Button } from "src/components/ui/button";
import ViewDeviceIcon from "src/components/icons/apfc/ViewDeviceIcon";
import AddIcon from "src/components/icons/apfc/AddIcon";
import { DeleteDeviceIcon } from "src/components/svg/DeletePond";
import { EditDeviceIcon } from "src/components/svg/EditDevice";
import { Minus } from "lucide-react";

interface ActionColumnProps {
  onEdit: (device: ApfcDevice) => void;
  onDelete: (deviceId: number) => void;
  onView: (device: ApfcDevice) => void;
  onAssignUser: (deviceId: number) => void;
  onDeleteUser: (deviceId: number) => void;
}

export const ApfcColumns = ({
  onEdit,
  onDelete,
  onView,
  onAssignUser,
  onDeleteUser,
}: ActionColumnProps): ColumnDef<ApfcDevice>[] => [
  {
    accessorFn: (row: any) => row.serial,
    id: "serial",
    header: () => (
      <span className="text-xs 3xl:text-sm whitespace-nowrap cursor-default rounded-tl-xl">
        S No
      </span>
    ),
    cell: (info: any) => (
      <span className="text-sm cursor-pointer w-full h-full block p-2 bg-white text-left">
        {info.getValue() || "--"}
      </span>
    ),
    size: 20,
  },
  {
    accessorFn: (row) => row.device_name,
    id: "device_name",
    cell: (info) => {
      const devicename = info.getValue() as string;
      return (
        <div className="w-full truncate text-left pl-2 overflow-hidden text-ellipsis whitespace-nowrap text-xs 3xl:text-sm bg-white">
          <span>{devicename}</span>
        </div>
      );
    },
    header: () => <span>Device Name</span>,
    size: 100,
  },
  {
    accessorFn: (row) => row.device_serial_number,
    id: "device_serial_number",
    cell: (info) => {
      const deviceSerialname = info.getValue() as string;
      return (
        <div className="w-full truncate text-left overflow-hidden text-ellipsis whitespace-nowrap text-xs 3xl:text-sm">
          <span>{deviceSerialname}</span>
        </div>
      );
    },
    header: () => <span>Device SNo</span>,
    size: 150,
  },
  {
    accessorFn: (row) => row?.location_name,
    id: "location_name",
    cell: (info) => {
      const location = info.getValue() as string | null;
      const formattedLocation = location
        ? location.charAt(0).toUpperCase() + location.slice(1).toLowerCase()
        : "--";
      return (
        <div className="w-full truncate text-left overflow-hidden text-ellipsis whitespace-nowrap text-xs 3xl:text-sm">
          <span title={location || "Unassigned"}>{formattedLocation}</span>
        </div>
      );
    },
    header: () => <span>Location</span>,
    size: 150,
  },
  {
    accessorFn: (row) => row.status,
    id: "status",
    cell: (info) => {
      const status = info.getValue() as string;
      return (
        <div className="flex items-center gap-2 text-xs 3xl:text-sm">
          <span
            className={`w-2 h-2 rounded-full ${status === "ACTIVE" ? "bg-green-500" : "bg-red-500"}`}
          ></span>
          <span>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
        </div>
      );
    },
    header: () => <span>Status</span>,
    size: 100,
  },
  {
    accessorFn: (row: any) => row?.user_full_name,
    id: "user_full_name",
    header: () => <span>Assigned To</span>,
    cell: (info: any) => {
      const userFullName = info?.getValue() as string | null;

      return (
        <div className="flex items-center gap-2 text-xs 3xl:text-sm">
          <span className="truncate">{userFullName || "--"}</span>
          {userFullName ? (
            <Button
              title="Remove User"
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteUser(info?.row?.original.id);
              }}
            >
              <Minus className="size-1" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                onAssignUser(info?.row?.original.id);
              }}
            >
              <AddIcon className="size-3" />
            </Button>
          )}
        </div>
      );
    },
    size: 100,
    minSize: 100,
  },
  {
    id: "actions",
    header: () => <span>Actions</span>,
    cell: ({ row }) => (
      <div className="flex">
        <Button
          className="bg-transparent hover:bg-transparent h-auto py-0 px-1"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row.original);
          }}
          title="Edit"
        >
          <EditDeviceIcon className="size-4" />
        </Button>
        <Button
          className="bg-transparent hover:bg-transparent h-auto py-0 px-1"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(row.original.id);
          }}
          title="Delete"
        >
          <DeleteDeviceIcon className="size-4" />
        </Button>
      </div>
    ),
    size: 60,
  },
];
