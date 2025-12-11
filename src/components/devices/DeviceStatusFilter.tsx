import { cn } from "@/lib/utils";
import React, { useEffect } from "react";
import { Switch } from "../ui/switch";
import { X } from "lucide-react";
import { useLocation } from "@tanstack/react-router";

export const DeviceStatusFilterChange = ({
  onStatusChange,
  disabled,
}: {
  onStatusChange: (value: string | null) => void;
  disabled?: boolean;
}) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialStatus = searchParams.get("status") || null;

  const [value, setValue] = React.useState<string | null>(initialStatus);

  useEffect(() => {
    onStatusChange(value);
  }, [value, onStatusChange]);

  const handleStatusChange = (selectedValue: boolean) => {
    setValue(selectedValue ? "ACTIVE" : "INACTIVE");
  };

  const handleClear = () => {
    setValue(null);
  };

  const isDisabled = disabled && !value;

  return (
    <div className={`flex items-center  space-x-1  p-1 rounded-lg  ${value === "ACTIVE" ? "bg-green-50" : ""}`}>
      <div>
        <Switch
          checked={value === "ACTIVE"}
          onCheckedChange={handleStatusChange}
          disabled={isDisabled}
          className={cn(
            "data-[state=checked]:bg-green-500",
            value === "INACTIVE"
              ? "data-[state=unchecked]:bg-red-500"
              : "data-[state=unchecked]:bg-gray-200",
            "h-5 scale-[0.9]",
            isDisabled && "opacity-50 cursor-not-allowed"
          )}
        />
      </div>

      {value && (
        <button
          onClick={handleClear}
          className="text-gray-500 hover:text-gray-700"
          disabled={isDisabled}
        >
          <X size={12} />
        </button>
      )}

      <label
        className={cn(
          "text-xs font-normal text-black select-none",
          isDisabled && "text-gray-400 cursor-not-allowed"
        )}
      >
        {value === "ACTIVE"
          ? "Active"
          : value === "INACTIVE"
            ? "Inactive"
            : "Status"}
      </label>
    </div>
  );
};
