import { statusConstants } from "@/lib/constants/exportDeviceData";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useEffect } from "react";
import DownArrowIcon from "../svg/DownArrow";

export const StatusFilter = ({
  onStatusChange,
}: {
  onStatusChange: (value: string | null) => void;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [value, setValue] = React.useState<string | null>(null);

  useEffect(() => {
    onStatusChange(value);
  }, [value, onStatusChange]);

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setValue(null);
    setIsOpen(false);
  };

  const handleSelect = (selectedValue: string) => {
    setValue(selectedValue);
    setIsOpen(false);
    onStatusChange(selectedValue);
  };

  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-[125px] justify-between relative bg-green-50 hover:bg-green-100 px-2 py-1 h-8 "
          >
            <span
              title={
                value
                  ? statusConstants.find((status) => status.value === value)
                    ?.label
                  : "Deployment Status"
              }
              className="truncate text-black-400 font-normal text-xs"
            >
              {value
                ? statusConstants.find((status) => status.value === value)
                  ?.label
                : "Deployment Status"}
            </span>
            <DownArrowIcon />
            {value && (
              <div onClick={handleClear} className="flex items-center">
                <X  className="h-4 w-4 cursor-pointer hover:bg-gray-200 rounded-sm flex-shrink-0" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[100px] p-0 text-start mt-1">
          <Command>
            <CommandList>
              <CommandEmpty>No status found.</CommandEmpty>
              <CommandGroup>
                {statusConstants.map((status) => {
                  const isSelected = value === status.value;
                  return (
                    <CommandItem
                      key={status.value}
                      onSelect={() => handleSelect(status.value)}
                      className={cn(
                        "text-xs font-normal flex justify-between items-center cursor-pointer",
                        isSelected && "bg-gray-100 text-black font-medium"
                      )}
                    >
                      <span>{status.label}</span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
