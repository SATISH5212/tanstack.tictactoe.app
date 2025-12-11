import React from "react";
import {
  DeviceSettings,
  DeviceSettingsLimits,
} from "src/lib/interfaces/core/settings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface TimingConfigurationSectionProps {
  getCurrentValue: (key: keyof DeviceSettings) => any;
  renderEditableField: (value: any, field: string) => React.ReactNode;
  editMode: boolean;
  minMaxRangeData: DeviceSettingsLimits | null | undefined;
}

export const TimingConfigurationSection: React.FC<
  TimingConfigurationSectionProps
> = ({ getCurrentValue, renderEditableField, editMode, minMaxRangeData }) => {
  return (
    <div className="p-4 border border-gray-200 rounded-md mt-3">
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        Timing Configuration
      </h3>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="text-black font-normal text-xs">
              Parameter
            </TableHead>
            {editMode && (
              <TableHead className="text-black font-normal text-xs">
                Min
              </TableHead>
            )}
            <TableHead className="text-black font-normal text-xs">
              Value
            </TableHead>
            {editMode && (
              <TableHead className="text-black font-normal text-xs">
                Max
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium text-gray-600 text-xs">
              Auto Start Seed Time
            </TableCell>
            {editMode && (
              <TableCell className="text-xs">
                {minMaxRangeData?.seed_time_min || "--"}
              </TableCell>
            )}
            <TableCell className="text-xs">
              <div className="flex items-center gap-x-1">
                <span>
                  {renderEditableField(
                    getCurrentValue("seed_time"),
                    "seed_time"
                  )}
                </span>
                <span>sec</span>
              </div>
            </TableCell>
            {editMode && (
              <TableCell className="text-xs">
                {minMaxRangeData?.seed_time_max || "--"}
              </TableCell>
            )}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium text-gray-600 text-xs">
              Auto Start Offset Time
            </TableCell>
            {editMode && (
              <TableCell className="text-xs">
                {minMaxRangeData?.start_timing_offset_min || "--"}
              </TableCell>
            )}
            <TableCell className="text-xs">
              <div className="flex items-center gap-x-1">
                <span>
                  {renderEditableField(
                    getCurrentValue("start_timing_offset"),
                    "start_timing_offset"
                  )}
                </span>
                <span>sec</span>
              </div>
            </TableCell>
            {editMode && (
              <TableCell className="text-xs">
                {minMaxRangeData?.start_timing_offset_max || "--"}
              </TableCell>
            )}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
