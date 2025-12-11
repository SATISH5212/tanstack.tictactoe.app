// components/MotorCalibrationSection.tsx
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

import {
  DeviceSettings,
  DeviceSettingsLimits,
} from "src/lib/interfaces/core/settings";

interface MotorCalibrationSectionProps {
  getCurrentValue: (key: keyof DeviceSettings) => any;
  renderEditableField: (value: any, field: string) => React.ReactNode;
  editMode: boolean;
  minMaxRangeData: DeviceSettingsLimits | null | undefined;
}

export const MotorCalibrationSection: React.FC<
  MotorCalibrationSectionProps
> = ({ getCurrentValue, renderEditableField, editMode, minMaxRangeData }) => {
  return (
    <div className="p-4 border border-gray-200 rounded-md">
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
            <TableHead className="text-black font-normal text-xs ">
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
              U Gain R for Atmel Calibration
            </TableCell>
            {editMode && (
              <TableCell className="text-xs ">
                {minMaxRangeData?.u_gain_r_min || "--"}
              </TableCell>
            )}
            <TableCell className="text-xs">
              {renderEditableField(getCurrentValue("u_gain_r"), "u_gain_r")}
            </TableCell>
            {editMode && (
              <TableCell className="text-xs">
                {minMaxRangeData?.u_gain_r_max || "--"}
              </TableCell>
            )}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium text-gray-600 text-xs">
              U Gain Y for Atmel Calibration
            </TableCell>
            {editMode && (
              <TableCell className="text-xs">
                {minMaxRangeData?.u_gain_y_min || "--"}
              </TableCell>
            )}
            <TableCell className="text-xs">
              {renderEditableField(getCurrentValue("u_gain_y"), "u_gain_y")}
            </TableCell>
            {editMode && (
              <TableCell className="text-xs">
                {minMaxRangeData?.u_gain_y_max || "--"}
              </TableCell>
            )}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium text-gray-600 text-xs">
              U Gain B for Atmel Calibration
            </TableCell>
            {editMode && (
              <TableCell className="text-xs">
                {minMaxRangeData?.u_gain_b_min || "--"}
              </TableCell>
            )}
            <TableCell className="text-xs">
              {renderEditableField(getCurrentValue("u_gain_b"), "u_gain_b")}
            </TableCell>
            {editMode && (
              <TableCell className="text-xs">
                {minMaxRangeData?.u_gain_b_max || "--"}
              </TableCell>
            )}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium text-gray-600 text-xs">
              I Gain R for Atmel Calibration
            </TableCell>
            {editMode && (
              <TableCell className="text-xs">
                {minMaxRangeData?.i_gain_r_min || "--"}
              </TableCell>
            )}
            <TableCell className="text-xs">
              {renderEditableField(getCurrentValue("i_gain_r"), "i_gain_r")}
            </TableCell>
            {editMode && (
              <TableCell className="text-xs">
                {minMaxRangeData?.i_gain_r_max || "--"}
              </TableCell>
            )}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium text-gray-600 text-xs">
              I Gain Y for Atmel Calibration
            </TableCell>
            {editMode && (
              <TableCell className="text-xs">
                {minMaxRangeData?.i_gain_y_min || "--"}
              </TableCell>
            )}
            <TableCell className="text-xs">
              {renderEditableField(getCurrentValue("i_gain_y"), "i_gain_y")}
            </TableCell>
            {editMode && (
              <TableCell className="text-xs">
                {minMaxRangeData?.i_gain_y_max || "--"}
              </TableCell>
            )}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium text-gray-600 text-xs">
              I Gain B for Atmel Calibration
            </TableCell>
            {editMode && (
              <TableCell className="text-xs">
                {minMaxRangeData?.i_gain_b_min || "--"}
              </TableCell>
            )}
            <TableCell className="text-xs">
              {renderEditableField(getCurrentValue("i_gain_b"), "i_gain_b")}
            </TableCell>
            {editMode && (
              <TableCell className="text-xs">
                {minMaxRangeData?.i_gain_b_max || "--"}
              </TableCell>
            )}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium text-gray-600 text-xs">
              Current Sense ADC Multiplication Value
            </TableCell>
            {editMode && (
              <TableCell className="text-xs">
                {minMaxRangeData?.current_multiplier_min || "--"}
              </TableCell>
            )}
            <TableCell className="text-xs">
              {renderEditableField(
                getCurrentValue("current_multiplier"),
                "current_multiplier"
              )}
            </TableCell>
            {editMode && (
              <TableCell className="text-xs">
                {minMaxRangeData?.current_multiplier_max || "--"}
              </TableCell>
            )}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
