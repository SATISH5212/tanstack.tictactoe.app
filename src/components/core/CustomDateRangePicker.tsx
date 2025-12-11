import React from "react";
import { DateRangePicker } from "rsuite";
import "rsuite/dist/rsuite.css";
interface CustomDateRangePickerProps {
  value: any;
  onChange: (value: any) => void;
}
const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
  value,
  onChange,
}) => {
  const handleDateRangeChange = (newValue: any) => {
    if (!newValue[0] && !newValue[1]) {
      const today = new Date();
      onChange([today, today]);
    } else {
      onChange(newValue);
    }
  };

  return (
    <DateRangePicker
      value={value}
      onChange={handleDateRangeChange}
      disabledDate={(date) => date.getTime() >= new Date().getTime()}
      editable={false}
      showOneCalendar
      placeholder="Start Date - End Date"
      placement="bottomEnd"
      className="w-64"
      ranges={[
        {
          label: "Today",
          value: [new Date(), new Date()],
          placement: "left",
        },
        {
          label: "Yesterday",
          value: [
            new Date(Date.now() - 86400000),
            new Date(Date.now() - 86400000),
          ],
          placement: "left",
        },
        {
          label: "Last 2 Days",
          value: [new Date(Date.now() - 172800000), new Date()],
          placement: "left",
        },
        {
          label: "Last 3 Days",
          value: [new Date(Date.now() - 259200000), new Date()],
          placement: "left",
        },
        {
          label: "Last Week",
          value: [new Date(Date.now() - 604800000), new Date()],
          placement: "left",
        },
        {
          label: "This Week",
          value: [
            new Date(
              new Date().setDate(new Date().getDate() - new Date().getDay())
            ),
            new Date(),
          ],
          placement: "left",
        },
      ]}
    />
  );
};

export default CustomDateRangePicker;
