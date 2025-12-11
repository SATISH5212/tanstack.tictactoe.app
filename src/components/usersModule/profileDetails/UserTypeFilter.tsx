import DownArrowIcon from "@/components/svg/DownArrow";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { userTypeeConstants } from "@/lib/constants/exportDeviceData";
import { X } from "lucide-react";
import React, { useEffect } from "react";

export const UserTypeFilter = ({
  onTypeChange,
  selectedType,
}: {
  onTypeChange: (value: string | null) => void;
  selectedType?: string;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [value, setValue] = React.useState<string | null>(null);


  useEffect(() => {
    setValue(selectedType || null);
  }, [selectedType]);

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setValue(null);
    setIsOpen(false);
    onTypeChange(null);
  };

  const handleSelect = (selectedValue: string) => {
    setValue(selectedValue);
    setIsOpen(false);
    onTypeChange(selectedValue);
  };

  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-[125px] justify-between relative  bg-green-50 hover:bg-green-100 px-2 py-1 h-8"
          >
            <span className="truncate text-black-400 font-normal text-xs">
              {value
                ? userTypeeConstants.find((type) => type.value === value)?.label
                : "User type"}
            </span>
            <DownArrowIcon />
            {value && (
              <div onClick={handleClear} className="flex items-center">
                <X className="h-4 w-4 cursor-pointer hover:bg-gray-200 rounded-sm flex-shrink-0" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[125px] p-0 text-start mt-1">
          <Command>
            <CommandList>
              <CommandEmpty>No user type found.</CommandEmpty>
              <CommandGroup>
                {userTypeeConstants.map((type) => (
                  <CommandItem
                    key={type.value}
                    onSelect={() => handleSelect(type.value)}
                    className="text-xs font-normal cursor-pointer hover:bg-gray-100"
                  >
                    {type.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
