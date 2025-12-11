import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";
import { useState } from "react";
import FilterIcon from "../svg/FilterIcon";

interface PondStatusFilterProps {
  pondStatus: string | null;
  onStatusChange: (value: string | null) => void;
  selectedFiltersCount: number;
  setSelectedRows: (rows: Map<number, string>) => void;
}

const POND_STATUSES = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function PondStatusFilter({
  pondStatus,
  onStatusChange,
  selectedFiltersCount,
  setSelectedRows,
}: PondStatusFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleStatusSelect = (status: string) => {
    const newStatus = status === "ALL" ? null : status;
    onStatusChange(newStatus);
    setIsFilterOpen(false);
    if (status === "ALL") {
      setSelectedRows(new Map());
    }
  };

  const getButtonStyles = () => {
    const base = "relative flex items-center gap-2 w-[80px] h-8 justify-center";
    const variant =
      selectedFiltersCount > 0
        ? "bg-blue-100 hover:bg-blue-200"
        : "bg-gray-100 hover:bg-gray-200";
    return `${base} ${variant}`;
  };

  const getMenuItemStyles = (status: string, isSelected: boolean) => {
    if (!isSelected) return "flex justify-between cursor-pointer my-0.5";
    return "flex justify-between cursor-pointer bg-gray-100 my-0.5 ";
  };

  return (
    <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen} >
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={getButtonStyles()}>
          <FilterIcon className="w-3 h-3 text-gray-600 mb-1" />
          <span className="font-normal text-xs">Filter</span>
          {selectedFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[8px]  text-white bg-green-500 rounded-full">
              {selectedFiltersCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-20 bg-white shadow-lg border border-gray-200">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center justify-between cursor-pointer">
            <span>Status</span>
          </DropdownMenuSubTrigger>

          <DropdownMenuPortal>
            <DropdownMenuSubContent className="bg-white shadow-lg border border-gray-200">
              {POND_STATUSES.map((status) => {
                const isSelected =
                  (pondStatus === null && status.value === "ALL") ||
                  pondStatus === status.value;

                return (
                  <DropdownMenuItem
                    key={status.value}
                    onClick={() => handleStatusSelect(status.value)}
                    className={getMenuItemStyles(status.value, isSelected)}
                  >
                    {status.label}

                    {isSelected && (
                      <Check
                        className={`w-4 h-4 ml-4 text-green-700`}
                      />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
