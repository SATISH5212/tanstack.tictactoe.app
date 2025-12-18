import React, { useEffect, useState } from "react";

import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  XIcon,
} from "lucide-react";

import dayjs from "dayjs";

import { DateRange } from "react-day-picker";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CustomSelectDropdown } from "../core/CustomSelectDropdown";
import { Calendar } from "../ui/calendar";

interface CustomDateRangePickerProps {
  date: DateRange | undefined;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  align?: "start" | "center" | "end";
  onChange?: (date: DateRange | undefined) => void;
  disablePast?: boolean;
  disableFuture?: boolean;
  title?: string;
  isTimePicker?: boolean;
  className?: string;
}

const CustomDateCalendar = ({
  date,
  setDate,
  align,
  title,
  onChange,
  disablePast,
  disableFuture,
  isTimePicker = false,
  className,
}: CustomDateRangePickerProps) => {
  const [selectedDate, setSelectedDate] = React.useState<DateRange | undefined>(
    date
  );
  const [startTime, setStartTime] = React.useState<string | undefined>(
    undefined
  );
  const [endTime, setEndTime] = React.useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  const formatLabel = () => {
    if (!date?.from) return title || "Date";
    if (date?.to) {
      return (
        `${dayjs(date.from).format("DD-MM-YYYY")}` +
        ` to ${dayjs(date.to).format("DD-MM-YYYY")}`
      );
    }
    // return (
    //   dayjs(date.from).format("DD-MM-YYYY") +
    //   (dayjs(date.from).format("hh:mm A") !== "12:00 AM"
    //     ? ` ${dayjs(date.from).format("hh:mm A")}`
    //     : "")
    // );
  };

  const disabledDays: any = React.useMemo(() => {
    const todayStart = dayjs().startOf("day").toDate();
    const todayEnd = dayjs().endOf("day").toDate();
    if (disablePast && disableFuture) {
      return { before: todayStart, after: todayEnd };
    }
    if (disablePast) return { before: todayStart };
    if (disableFuture) return { after: todayEnd };
    return undefined;
  }, [disablePast, disableFuture]);

  const handleSubmit = () => {
    if (selectedDate) {
      const merged: DateRange = { ...selectedDate } as DateRange;
      if (startTime && merged.from) {
        const [time, period] = startTime.split(" ");
        let [hour, minute] = time.split(":").map(Number);
        if (period === "PM" && hour !== 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;
        const from = dayjs(merged.from).hour(hour).minute(minute);
        merged.from = from.toDate();
      }
      if (endTime && merged.to) {
        const [time, period] = endTime.split(" ");
        let [hour, minute] = time.split(":").map(Number);
        if (period === "PM" && hour !== 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;
        const to = dayjs(merged.to).hour(hour).minute(minute);
        merged.to = to.toDate();
      }
      setDate(merged);
      onChange?.(merged);
    } else {
      setDate(selectedDate);
      onChange?.(selectedDate);
    }
    setOpen(false);
  };

  const resetDate = () => {
    setSelectedDate(undefined);
    setDate(undefined);
    setStartTime(undefined);
    setEndTime(undefined);
  };

  console.log(selectedDate,"selectedDate",date,"date");
  

  return (
    <div>
      <Popover
        modal
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (open) {
            setSelectedDate(date);
          } 
        }}
      >
        <PopoverTrigger asChild>
          <Button
            className={`border w-full text-sm font-normal text-black flex items-center justify-start border-gray-300 py-1.5 h-8 rounded-md px-3 bg-transparent hover:bg-gray-50 transition-colors cursor-pointer ${className}`}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
            <span className="text-smd flex-1 text-left">{formatLabel()}</span>
            {date?.from ? (
              <span
                className="cursor-pointer hover:bg-gray-100 rounded p-0.5 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  resetDate();
                }}
              >
                <XIcon className="h-4 w-4 shrink-0 text-gray-500" />
              </span>
            ) : (
              <div>
                {open ? (
                  <ChevronUp className="ml-2 h-4 w-4 shrink-0 text-gray-500" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-gray-500" />
                )}
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align={align}
          sideOffset={4}
          className="w-auto bg-white z-[100] border border-gray-200 shadow-xl rounded-lg "
        >
          <div className="p-3 pb-2">
            <div className="">
              <Calendar
                mode="range"
                numberOfMonths={2}
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={disabledDays}
                endMonth={new Date(currentYear + 10, 11)}
                captionLayout="dropdown"
                components={{
                  Dropdown: CustomSelectDropdown,
                }}
                className="p-0"
                classNames={{
                  day_range_middle: "bg-lime-100",
                  day_range_start: "bg-lime-500 text-white",
                  day_range_end: "bg-lime-500 text-white",
                  day_selected: "bg-lime-500 text-white hover:bg-lime-600",
                  day: " flex items-center justify-center hover:bg-gray-100 rounded-md text-smd transition-colors [&_button]:text-smd [&_button]:h-7 [&_button]:w-7",
                  head_cell:
                    "text-sm flex justify-center font-medium w-full text-gray-600",
                  week: "flex w-full gap-1 mt-1",
                  month: "flex flex-col w-full gap-2",
                  caption_label:
                    "rounded-md pl-2 pr-1 flex items-center gap-1 text-smd h-7 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
                  nav: "mr-0",
                  button_previous:
                    "absolute left-4  h-8 flex items-center justify-center hover:bg-gray-100 rounded-md w-8",
                  button_next:
                    "absolute right-4 h-8 w-8 justify-center hover:bg-gray-100 rounded-md flex items-center",
                  months: "flex space-x-4",
                }}
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() => {
                  const today = dayjs();
                  const range = {
                    from: today.startOf("day").toDate(),
                    to: today.endOf("day").toDate(),
                  };
                  setSelectedDate(range);
                  onChange?.(range);
                }}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  selectedDate?.from &&
                  selectedDate?.to &&
                  dayjs(selectedDate.from).isSame(dayjs(), "day") &&
                  dayjs(selectedDate.to).isSame(dayjs(), "day")
                    ? "bg-green-400 text-white hover:bg-green-500"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                Today
              </button>

              <button
                onClick={() => {
                  const to = dayjs();
                  const from = dayjs().subtract(5, "day");
                  const range = {
                    from: from.startOf("day").toDate(),
                    to: to.endOf("day").toDate(),
                  };
                  setSelectedDate(range);
                  onChange?.(range);
                }}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  selectedDate?.from &&
                  selectedDate?.to &&
                  dayjs(selectedDate.from).isSame(
                    dayjs().subtract(5, "day"),
                    "day"
                  ) &&
                  dayjs(selectedDate.to).isSame(dayjs(), "day")
                    ? "bg-green-400 text-white hover:bg-green-500"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                Last 5 Days
              </button>

              <button
                onClick={() => {
                  const to = dayjs();
                  const from = dayjs().subtract(10, "day");
                  const range = {
                    from: from.startOf("day").toDate(),
                    to: to.endOf("day").toDate(),
                  };
                  setSelectedDate(range);
                  onChange?.(range);
                }}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  selectedDate?.from &&
                  selectedDate?.to &&
                  dayjs(selectedDate.from).isSame(
                    dayjs().subtract(10, "day"),
                    "day"
                  ) &&
                  dayjs(selectedDate.to).isSame(dayjs(), "day")
                    ? "bg-green-400 text-white hover:bg-green-500"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                Last 10 Days
              </button>

              <button
                onClick={() => {
                  const to = dayjs();
                  const from = dayjs().subtract(1, "month");
                  const range = {
                    from: from.startOf("day").toDate(),
                    to: to.endOf("day").toDate(),
                  };
                  setSelectedDate(range);
                  onChange?.(range);
                }}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  selectedDate?.from &&
                  selectedDate?.to &&
                  dayjs(selectedDate.from).isSame(
                    dayjs().subtract(1, "month"),
                    "day"
                  ) &&
                  dayjs(selectedDate.to).isSame(dayjs(), "day")
                    ? "bg-green-400 text-white hover:bg-green-500"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                Last Month
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedDate(undefined);
                  setStartTime(undefined);
                  setEndTime(undefined);
                  setDate(undefined);
                  onChange?.(undefined);
                  setOpen(false);
                }}
                className="px-4 py-1 border border-gray-300 rounded-lg text-smd font-medium bg-white hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Clear
              </button>

              <button
                type="button"
                disabled={
                  !selectedDate?.from ||
                  !selectedDate?.to ||
                  (isTimePicker && (!startTime || !endTime))
                }
                onClick={handleSubmit}
                className="px-4 py-1 bg-green-500 text-white rounded-lg text-smd font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-lime-500 cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CustomDateCalendar;
