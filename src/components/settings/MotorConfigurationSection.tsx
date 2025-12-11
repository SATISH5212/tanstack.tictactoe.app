// components/MotorConfigurationSection.tsx
import React from "react";

import {
  DeviceSettingsData,
  DeviceSettingsLimits,
  MotorSettings,
} from "src/lib/interfaces/core/settings";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

interface MotorConfigurationSectionProps {
  deviceSettingsData: DeviceSettingsData | null;
  getMotorValue: (motorIndex: number, key: keyof MotorSettings) => any;
  renderEditableField: (
    value: any,
    field: string,
    isMotorField?: boolean,
    motorIndex?: number,
    motorKey?: keyof MotorSettings
  ) => React.ReactNode;
  editMode: boolean;
  minMaxRangeData: DeviceSettingsLimits | null | undefined;
}

export const MotorConfigurationSection: React.FC<
  MotorConfigurationSectionProps
> = ({
  deviceSettingsData,
  getMotorValue,
  renderEditableField,
  editMode,
  minMaxRangeData,
}) => {
  return (
    <div className="p-4 border border-gray-200 rounded-md mt-3">
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        Motor Configuration
      </h3>
      <Table>
        <TableHeader>
          <TableRow className=""></TableRow>
          <TableRow className="bg-gray-100">
            <TableHead className="text-black font-normal text-xs">
              Parameter
            </TableHead>
            <TableHead className="text-black font-normal text-xs">
              Motor 1
            </TableHead>
            {deviceSettingsData?.capable_motors === 2 && (
              <TableHead className="text-black font-normal text-xs">
                Motor 2
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium text-gray-600 text-xs">
              HP
            </TableCell>
            <TableCell className="text-xs font-medium">
              <span>{getMotorValue(0, "hp") ?? "--"}</span>
            </TableCell>
            {deviceSettingsData?.capable_motors === 2 && (
              <TableCell className="text-xs font-medium">
                <span>{getMotorValue(1, "hp") ?? "--"}</span>
              </TableCell>
            )}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium text-gray-600 text-xs">
              FLC
            </TableCell>
            <TableCell className="text-xs">
              <div className="flex items-center gap-2">
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.full_load_current_min || "--"}
                    <div>Min</div>
                  </div>
                )}
                <div className="flex items-center gap-x-2">
                  <span>
                    {renderEditableField(
                      getMotorValue(0, "full_load_current"),
                      `motor_0_full_load_current`,
                      true,
                      0,
                      "full_load_current"
                    )}
                  </span>
                  <span>A</span>
                </div>
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.full_load_current_max || "--"}
                    <div>Max</div>
                  </div>
                )}
              </div>
            </TableCell>
            {deviceSettingsData?.capable_motors === 2 && (
              <TableCell className="text-xs">
                <div className="flex items-center gap-2">
                  {editMode && (
                    <div className="flex flex-col items-center">
                      {minMaxRangeData?.full_load_current_min || "--"}
                      <div>Min</div>
                    </div>
                  )}
                  <div className="flex items-center gap-x-2">
                    <span>
                      {renderEditableField(
                        getMotorValue(1, "full_load_current"),
                        `motor_1_full_load_current`,
                        true,
                        1,
                        "full_load_current"
                      )}
                    </span>
                    <span>A</span>
                  </div>
                  {editMode && (
                    <div className="flex flex-col items-center">
                      {minMaxRangeData?.full_load_current_max || "--"}
                      <div>Max</div>
                    </div>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
