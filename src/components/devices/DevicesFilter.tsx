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
import {
  DEVICE_POWER,
  DEVICE_STATUSES,
  statusConstants,
} from "@/lib/constants/exportDeviceData";
import { useUserDetails } from "@/lib/helpers/userpermission";
import { DevicesFilterProps } from "@/lib/interfaces/devices";
import { Check } from "lucide-react";
import { useState } from "react";
import FilterIcon from "../svg/FilterIcon";

export function DevicesFilter({
  handleDeviceDeploymentStatusChange,
  handleDeviceStatusChange,
  handleDevicePowerChange,
  deviceStatusFilter,
  devicePowerFilter,
  selectedStatus,
  selectedFiltersCount,
}: DevicesFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { isAdmin } = useUserDetails();

  const closeAndApply = (value: string, handler: (v: string) => void) => {
    handler(value);
    setIsFilterOpen(false);
  };

  const getButtonStyles = () => {
    const base = "relative flex items-center gap-2 w-[80px] h-7 justify-center";
    return selectedFiltersCount > 0
      ? `${base} bg-blue-100 hover:bg-blue-200`
      : `${base} bg-gray-100 hover:bg-gray-200`;
  };

  const menuItemClass = (active: boolean) =>
    `flex justify-between cursor-pointer my-0.5 ${active ? "bg-gray-100" : ""
    }`;

  const renderItem = (
    item: { value: string; label: string },
    isSelected: boolean,
    onSelect: (value: string) => void
  ) => (
    <DropdownMenuItem
      key={item.value}
      onClick={() => closeAndApply(item.value, onSelect)}
      className={menuItemClass(isSelected)}
    >
      {item.label}
      {isSelected && <Check className="w-4 h-4 text-green-600" />}
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={getButtonStyles()}>
          <FilterIcon className="w-3 h-3 text-gray-600" />
          <span className="font-normal">Filter</span>
          {selectedFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 text-[8px] flex items-center justify-center text-white bg-green-500 rounded-full">
              {selectedFiltersCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-48 bg-white shadow-lg border" align="start">
              <DropdownMenuSub>
          <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {DEVICE_STATUSES.map((status) =>
                renderItem(
                  status,
                  deviceStatusFilter === status.value,
                  handleDeviceStatusChange
                )
              )}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Power</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {DEVICE_POWER.map((power) =>
                renderItem(
                  power,
                  devicePowerFilter === power.value,
                  handleDevicePowerChange
                )
              )}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

       
        {isAdmin() && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Deployment Status</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {renderItem(
                  { value: "ALL", label: "ALL" },
                  selectedStatus === "ALL",
                  handleDeviceDeploymentStatusChange
                )}
                {statusConstants.map((status) =>
                  renderItem(
                    status,
                    selectedStatus === status.value,
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
