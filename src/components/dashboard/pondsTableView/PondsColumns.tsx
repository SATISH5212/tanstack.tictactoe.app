import { AlertIcon } from "@/components/icons/stats/AlertIcon";
import { MotorOffIcon } from "@/components/icons/stats/MotorOff";
import { PowerOn } from "@/components/icons/stats/PowerOn";
import { DeleteDeviceIcon } from "@/components/svg/DeletePond";
import { MotorSvg } from "@/components/svg/MotorSvg";
import PondEditIcon from "@/components/svg/PondEditIcon";
import { useUserDetails } from "@/lib/helpers/userpermission";
import { Pond } from "@/lib/interfaces/maps/ponds";
import { CellContext } from "@tanstack/react-table";

export default function PondsColumns(
  onEditPond: (pond: Pond) => void,
  onDeletePond: (pond: Pond) => void,
  selectedRows: Map<number, string>,
  handleCheckboxRowSelect: (id: number, title: string) => void,
  handleSelectAllCheckbox: () => void,
  allSelected: boolean,
  pondStatus : string | null
) {
  const columns = [];

  if (pondStatus) {
    columns.push({
      id: "select",
      header: () => (
        <div
          className="flex items-center justify-center w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => {
              e.stopPropagation();
              handleSelectAllCheckbox();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 cursor-pointer accent-green-600"
          />
        </div>
      ),
      cell: ({ row }: CellContext<Pond, number>) => (
        <div
          className="flex items-center justify-center w-full py-2 h-10 text-xs 3xl:text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={selectedRows?.has(row.original.id) || false}
            onChange={(e) => {
              e.stopPropagation();
              handleCheckboxRowSelect(row.original.id, row.original.title);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 cursor-pointer accent-green-600"
          />
        </div>
      ),
      size: 20,
      minSize: 20,
      maxSize: 20,
      enableSorting: false,
    });
  }

  columns.push(
    {
      accessorKey: "serial",
      id: "serial",
      header: () => (
        <div className="flex items-start justify-center">
          <span className="text-xs ">S No</span>
        </div>
      ),
      cell: (info: CellContext<Pond, number>) => (
        <div className="flex items-center justify-center w-full py-2 h-10 text-xs 3xl:text-sm">
          {info.getValue()}
        </div>
      ),
      size: 30,
      minSize: 25,
      maxSize: 25,
    },
    {
      accessorKey: "title",
      id: "title",
      header: () => (
        <div className="flex items-center justify-start w-full">
          <span className="text-xs">Pond Name</span>
        </div>
      ),
      cell: (info: CellContext<Pond, string>) => {
        const t = info.getValue() || "-";
        const formatted = t.charAt(0).toUpperCase() + t.slice(1);
        return (
          <div className={` py-2  font-normal flex items-center justify-start text-center w-full px-2 truncate h-10 text-xs 3xl:text-sm`}
            title={formatted}
          >
            {formatted}
          </div>
        );
      },
      size: 120,
      minSize: 100,
    },
    {
      accessorKey: "motors",
      id: "motors_count",
      header: () => (
        <div className="flex items-center justify-center w-full">
          <span className="text-x">Motors</span>
        </div>
      ),
      cell: (info: CellContext<Pond, number>) => (
        <div className="flex items-center justify-center gap-1.5 w-full py-2  text-xs 3xl:text-sm h-10" >
          <MotorSvg className="w-5 h-5 flex-shrink-0" />
          <span className=" rounded-md px-1.5 py-[2px] font-normal text-center">
            {info.row.original.motors?.length || 0}
          </span>
        </div>
      ),
      size: 70,
      minSize: 70,
      maxSize: 70,
    },
    {
      accessorKey: "power_on_count",
      id: "power_on_count",
      header: () => (
        <div className="flex items-center justify-center w-full">
          <span className="text-xs">Power</span>
        </div>
      ),
      cell: (info: CellContext<Pond, number>) => (
        <div className="flex items-center justify-center gap-1.5 w-full py-2 text-xs 3xl:text-sm  h-10">
          <PowerOn className="w-5 h-5 flex-shrink-0" />
          <span className="font-normal text-center">{info.getValue()}</span>
        </div>
      ),
      size: 65,
      minSize: 65,
      maxSize: 65,
    },
    {
      accessorKey: "motors_on_count",
      id: "motors_on_count",
      header: () => (
        <div className="flex items-center justify-center w-full">
          <span className="text-xs">On</span>
        </div>
      ),
      cell: (info: CellContext<Pond, number>) => (
        <div className="flex items-center justify-center gap-1.5 w-full py-1  text-xs 3xl:text-sm h-10">
          <img src="/assets/Fan animation.svg" className="w-8 h-8 flex-shrink-0" alt="On" />
          <span className="font-normal text-center">{info.getValue()}</span>
        </div>
      ),
      size: 60,
      minSize: 60,
      maxSize: 60,
    },
    {
      accessorKey: "motors_off_count",
      id: "motors_off_count",
      header: () => (
        <div className="flex items-center justify-center w-full">
          <span className="text-xs">Off</span>
        </div>
      ),
      cell: (info: CellContext<Pond, number>) => (
        <div className="flex items-center justify-center gap-1.5 w-full py-1 text-xs 3xl:text-sm h-10">
          <MotorOffIcon className="w-8 h-8 flex-shrink-0" />
          <span className="font-normal text-center">{info.getValue()}</span>
        </div>
      ),
      size: 60,
      minSize: 60,
      maxSize: 60,
    },
    {
      accessorKey: "alert_count",
      id: "alert_count",
      header: () => (
        <div className="flex items-center justify-center w-full">
          <span className="text-xs">Faults</span>
        </div>
      ),
      cell: (info: CellContext<Pond, number>) => (
        <div className="flex items-center justify-center gap-1.5 w-full py-1 text-xs 3xl:text-sm h-10">
          <AlertIcon className="w-10 h-10 text-red-500 flex-shrink-0" />
          <span className="font-normal text-center">{info.getValue()}</span>
        </div>
      ),
      size: 70,
      minSize: 70,
      maxSize: 70,
    },
    {
      accessorKey: "control_mode",
      id: "control_mode",
      header: () => (
        <div className="flex items-center justify-center w-full">
          <span className="text-xs">Control Mode</span>
        </div>
      ),
      cell: ({ row }: CellContext<Pond, string>) => {
        const p = row.original;
        return (
          <div className="flex items-center justify-center gap-2 w-full py-2 text-[11px] text-xs 3xl:text-sm h-10">
            <div className="flex items-center gap-0.5">
              <span className="whitespace-nowrap">Manual</span>
              <span className="px-1.5 py-[1px]  rounded-md font-normal text-center">
                {p.manual_count || 0}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="whitespace-nowrap">Auto</span>
              <span className="px-1.5 py-[1px]  rounded-md font-normal text-center">
                {p.auto_count || 0}
              </span>
            </div>
          </div>
        );
      },
      size: 140,
      minSize: 140,
      maxSize: 140,
    },
    {
      id: "actions",
      enableSorting: false,
      header: () => (
        <div className="flex items-center justify-center w-full">
          <span className="text-xs ">Actions</span>
        </div>
      ),
      cell: ({ row }: CellContext<Pond, string>) => {
        const pond = row.original;
        const { isOwner, isManager } = useUserDetails();
        const allowed = isOwner() || isManager();

        return (
          <div className="flex items-center justify-center gap-2 w-full py-1 h-10 text-xs 3xl:text-sm">
            <button
              disabled={!allowed}
              onClick={(e) => {
                e.stopPropagation();
                allowed && onEditPond(pond);
              }}
              className="transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Edit pond"
            >
              <PondEditIcon className="w-5 h-5  hover:text-orange-500" />
            </button>
            <button
              disabled={!allowed}
              onClick={(e) => {
                e.stopPropagation();
                allowed && onDeletePond?.(pond);
              }}
              className="transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:text-red-500"
              aria-label="Delete pond"
            >
              <DeleteDeviceIcon className="size-4" />
            </button>
          </div>
        );
      },
      size: 70,
      minSize: 70,
      maxSize: 70,
    }
  );

  return columns;
}