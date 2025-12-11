import { cn } from "@/lib/utils";
import React, { useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { useLocation } from "@tanstack/react-router";

export const PowerFilter = ({
  onPowerStatusChange,
}: {
  onPowerStatusChange: (value: string | null) => void;
}) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialPowerStatus = searchParams.get("power_status") || null;

  const [value, setValue] = React.useState<string | null>(initialPowerStatus);

  useEffect(() => {
    onPowerStatusChange(value);
  }, [value, onPowerStatusChange]);

  const handleCheckedChange = (checked: boolean) => {
    setValue(checked ? "ON" : "OFF");
  };

  const handleClear = () => {
    setValue(null);
  };

  return (
    <div className="flex items-center space-x-1 w-20 h-3 mr-2">
      <div>
        <Switch
          checked={value === "ON"}
          onCheckedChange={handleCheckedChange}
          className={cn(
            "data-[state=checked]:bg-green-500",
            value === "OFF"
              ? "data-[state=unchecked]:bg-red-500"
              : "data-[state=unchecked]:bg-gray-200",
            "h-5 scale-[0.9]"
          )}
        />
      </div>
      {value && (
        <button
          onClick={handleClear}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={12} />
        </button>
      )}
      <label className="text-xs font-normal text-black cursor-pointer select-none">
        {value === "ON" ? "On" : value === "OFF" ? "Off" : "Power"}
      </label>
    </div>
  );
};
