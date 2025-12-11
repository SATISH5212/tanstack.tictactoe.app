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
import { DEVICE_STATUSES, statusConstants } from "@/lib/constants/exportDeviceData";
import { useUserDetails } from "@/lib/helpers/userpermission";
import { DevicesFilterProps } from "@/lib/interfaces/devices";
import { Check } from "lucide-react";
import { useState } from "react";
import FilterIcon from "../svg/FilterIcon";

export function DevicesFilter({
  handleDeviceDeploymentStatusChange,
  handleDeviceStatusChange,
  deviceStatusFilter,
  selectedStatus,
  selectedFiltersCount,
}: DevicesFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { isAdmin } = useUserDetails();

  const handleStatusSelect = (status: string, handler: (status: string) => void) => {
    handler(status);
    setIsFilterOpen(false);
  };

  const getButtonStyles = () => {
    const baseStyles = "relative flex items-center gap-2 w-[80px] h-7 justify-center";
    const variantStyles = selectedFiltersCount > 0
      ? "bg-blue-100 hover:bg-blue-200"
      : "bg-gray-100 hover:bg-gray-200";
    return `${baseStyles} ${variantStyles}`;
  };

 const getMenuItemStyles = (status: string, isSelected: boolean) => {
    if (!isSelected) return "flex justify-between cursor-pointer my-0.5";
    return "flex justify-between cursor-pointer bg-gray-100 my-0.5 ";
  };


  const renderMenuItem = (
    item: { value: string; label: string },
    isSelected: boolean,
    handler: (status: string) => void
  ) => (
    <DropdownMenuItem
      key={item.value}
      onClick={() => handleStatusSelect(item.value, handler)}
      className={getMenuItemStyles(item.value, isSelected)}
    >
      {item.label}
      {isSelected && (
        <Check
          className={`w-4 h-4 ml-4 text-green-600`}
        />
      )}
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={getButtonStyles()}>
          <FilterIcon className="w-3 h-3 text-gray-600" />
          <span className="font-normal">Filter</span>
          {selectedFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[8px] font-normal text-white bg-green-500 rounded-full">
              {selectedFiltersCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-48 bg-white shadow-lg border border-gray-200"
        side="bottom"
        align="start"
      >
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center justify-between cursor-pointer">
            <span>Status</span>
          </DropdownMenuSubTrigger>

          <DropdownMenuPortal>
            <DropdownMenuSubContent className="bg-white shadow-lg border border-gray-200">
              {DEVICE_STATUSES.map((status) =>
                renderMenuItem(
                  status,
                  deviceStatusFilter === status.value,
                  handleDeviceStatusChange
                )
              )}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {isAdmin() && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center justify-between cursor-pointer">
              <span>Deployment Status</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-white shadow-lg border border-gray-200">
                {renderMenuItem(
                  { value: "ALL", label: "ALL" },
                  selectedStatus === "ALL",
                  handleDeviceDeploymentStatusChange
                )}
                {statusConstants.map((status) =>
                  renderMenuItem(
                    status,
                    status.value === selectedStatus,
                    handleDeviceDeploymentStatusChange
                  )
                )}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DevicesFilter;
