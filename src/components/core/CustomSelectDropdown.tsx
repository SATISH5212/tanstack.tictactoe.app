import { DropdownProps } from "react-day-picker";
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function CustomSelectDropdown(props: DropdownProps) {
  const { options, value, onChange } = props;

  const handleValueChange = (newValue: string) => {
    onChange?.({
      target: { value: newValue },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  return (
    <Select
      value={value?.toString()}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className="h-8 cursor-pointer">
        <SelectValue />
      </SelectTrigger>

      <SelectContent
        position="popper"
        className="z-[200] max-h-[40vh] bg-white"
      >
        <SelectGroup>
          {options?.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value.toString()}
              disabled={option.disabled}
              className="cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
