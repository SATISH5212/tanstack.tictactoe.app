// components/DeviceSettingsSection.tsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DeviceSettings,
  DeviceSettingsData,
  DeviceSettingsLimits,
} from "src/lib/interfaces/core/settings";

interface DeviceSettingsSectionProps {
  deviceSettingsData: DeviceSettingsData | null;
  getCurrentValue: (key: keyof DeviceSettings) => any;
  renderEditableField: (value: any, field: string) => React.ReactNode;
  editMode: boolean;
  minMaxRangeData: DeviceSettingsLimits | null | undefined;
  handleInputChange: (
    key: keyof DeviceSettings,
    value: string | number
  ) => void;
  handleDoubleClick: (field: string) => void;
}

export const DeviceSettingsSection: React.FC<DeviceSettingsSectionProps> = ({
  deviceSettingsData,
  getCurrentValue,
  renderEditableField,
  editMode,
  minMaxRangeData,
  handleInputChange,
  handleDoubleClick,
}) => {
  return (
    <div className="p-4 border border-gray-200 rounded-md mt-3">
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        Device Settings
      </h3>
      <span className="text-xs text-gray-600">
        Total Motors: {deviceSettingsData?.motor_specific_limits?.length ?? 0}
      </span>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead rowSpan={2} className="text-black font-normal text-xs">
              Parameter
            </TableHead>
            <TableHead className="text-black font-normal text-xs">
              Alert
            </TableHead>
            <TableHead className="text-black font-normal text-xs">
              Fault
            </TableHead>
            <TableHead className="text-black font-normal text-xs">
              Recovery
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Phase Failure */}
          <TableRow>
            <TableCell className="font-medium text-gray-600 text-xs">
              Phase Failure
            </TableCell>
            <TableCell className="text-xs">
              <div className="flex items-center gap-2">
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.phase_failure_alert_min || "--"}
                    <div>Min</div>
                  </div>
                )}
                <div className="flex items-center gap-x-1">
                  <span>
                    {renderEditableField(
                      getCurrentValue("phase_failure_alert"),
                      "phase_failure_alert"
                    )}
                  </span>
                  <span>V</span>
                </div>
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.phase_failure_alert_max || "--"}
                    <div>Max</div>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="text-xs">
              <div className="flex items-center gap-2">
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.input_phase_failure_min || "--"}
                    <div>Min</div>
                  </div>
                )}
                <div className="flex items-center">
                  <span>
                    {renderEditableField(
                      getCurrentValue("input_phase_failure"),
                      "input_phase_failure"
                    )}
                  </span>
                  <span>V</span>
                </div>
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.input_phase_failure_max || "--"}
                    <div>Max</div>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="text-xs">-</TableCell>
          </TableRow>

          {/* Low Voltage */}
          <TableRow>
            <TableCell className="font-medium text-gray-600 text-xs">
              Low Voltage
            </TableCell>
            <TableCell className="text-xs">
              <div className="flex items-center gap-2">
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.low_voltage_alert_min || "--"}
                    <div>Min</div>
                  </div>
                )}
                <div className="flex items-center gap-x-1">
                  <span>
                    {renderEditableField(
                      getCurrentValue("low_voltage_alert"),
                      "low_voltage_alert"
                    )}
                  </span>
                  <span>V</span>
                </div>
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.low_voltage_alert_max || "--"}
                    <div>Max</div>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="text-xs">
              <div className="flex items-center gap-x-1">
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.low_voltage_fault_min || "--"}
                    <div>Min</div>
                  </div>
                )}
                <div className="flex items-center gap-x-1">
                  <span>
                    {renderEditableField(
                      getCurrentValue("low_voltage_fault"),
                      "low_voltage_fault"
                    )}
                  </span>
                  <span>V</span>
                </div>
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.low_voltage_fault_max || "--"}
                    <div>Max</div>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="text-xs">
              <div className="flex items-center gap-2">
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.low_voltage_recovery_min || "--"}
                    <div>Min</div>
                  </div>
                )}
                <div className="flex items-center gap-x-1">
                  <span>
                    {renderEditableField(
                      getCurrentValue("low_voltage_recovery"),
                      "low_voltage_recovery"
                    )}
                  </span>
                  <span>V</span>
                </div>
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.low_voltage_recovery_max || "--"}
                    <div>Max</div>
                  </div>
                )}
              </div>
            </TableCell>
          </TableRow>

          {/* High Voltage */}
          <TableRow>
            <TableCell className="font-medium text-gray-600 text-xs">
              High Voltage
            </TableCell>
            <TableCell className="text-xs">
              <div className="flex items-center gap-2">
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.high_voltage_alert_min || "--"}
                    <div>Min</div>
                  </div>
                )}
                <div className="flex items-center gap-x-1">
                  <span>
                    {renderEditableField(
                      getCurrentValue("high_voltage_alert"),
                      "high_voltage_alert"
                    )}
                  </span>
                  <span>V</span>
                </div>
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.high_voltage_alert_max || "--"}
                    <div>Max</div>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="text-xs">
              <div className="flex items-center gap-2">
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.high_voltage_fault_min || "--"}
                    <div>Min</div>
                  </div>
                )}
                <div className="flex items-center gap-x-1">
                  <span>
                    {renderEditableField(
                      getCurrentValue("high_voltage_fault"),
                      "high_voltage_fault"
                    )}
                  </span>
                  <span>V</span>
                </div>
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.high_voltage_fault_max || "--"}
                    <div>Max</div>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="text-xs">
              <div className="flex items-center gap-2">
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.high_voltage_recovery_min || "--"}
                    <div>Min</div>
                  </div>
                )}
                <div className="flex items-center gap-x-1">
                  <span>
                    {renderEditableField(
                      getCurrentValue("high_voltage_recovery"),
                      "high_voltage_recovery"
                    )}
                  </span>
                  <span>V</span>
                </div>
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.high_voltage_recovery_max || "--"}
                    <div>Max</div>
                  </div>
                )}
              </div>
            </TableCell>
          </TableRow>

          {/* Voltage Imbalance */}
          <TableRow>
            <TableCell className="font-medium text-gray-600 text-xs">
              Voltage Imbalance
            </TableCell>
            <TableCell className="text-xs">
              <div className="flex items-center gap-2">
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.voltage_imbalance_alert_min || "--"}
                    <div>Min</div>
                  </div>
                )}
                <div className="flex items-center gap-x-1">
                  <span>
                    {renderEditableField(
                      getCurrentValue("voltage_imbalance_alert"),
                      "voltage_imbalance_alert"
                    )}
                  </span>
                  <span>%</span>
                </div>
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.voltage_imbalance_alert_max || "--"}
                    <div>Max</div>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="text-xs">
              <div className="flex items-center gap-2">
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.voltage_imbalance_fault_min || "--"}
                    <div>Min</div>
                  </div>
                )}
                <div className="flex items-center gap-x-1">
                  <span>
                    {renderEditableField(
                      getCurrentValue("voltage_imbalance_fault"),
                      "voltage_imbalance_fault"
                    )}
                  </span>
                  <span>%</span>
                </div>
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.voltage_imbalance_fault_max || "--"}
                    <div>Max</div>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="text-xs">-</TableCell>
          </TableRow>

          {/* Minimum Phase Angle */}
          <TableRow>
            <TableCell className="font-medium text-gray-600 text-xs">
              Minimum Phase Angle
            </TableCell>
            <TableCell className="text-xs">
              <div className="flex items-center gap-2">
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.min_phase_angle_alert_min || "--"}
                    <div>Min</div>
                  </div>
                )}
                <div className="flex items-center gap-x-1">
                  <span>
                    {renderEditableField(
                      getCurrentValue("min_phase_angle_alert"),
                      "min_phase_angle_alert"
                    )}
                  </span>
                  <span>°</span>
                </div>
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.min_phase_angle_alert_max || "--"}
                    <div>Max</div>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="text-xs">
              <div className="flex items-center gap-2">
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.min_phase_angle_fault_min || "--"}
                    <div>Min</div>
                  </div>
                )}
                <div className="flex items-center gap-x-1">
                  <span>
                    {renderEditableField(
                      getCurrentValue("min_phase_angle_fault"),
                      "min_phase_angle_fault"
                    )}
                  </span>
                  <span>°</span>
                </div>
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.min_phase_angle_fault_max || "--"}
                    <div>Max</div>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="text-xs">-</TableCell>
          </TableRow>

          {/* Maximum Phase Angle */}
          <TableRow>
            <TableCell className="font-medium text-gray-600 text-xs">
              Maximum Phase Angle
            </TableCell>
            <TableCell className="text-xs">
              <div className="flex items-center gap-2">
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.max_phase_angle_alert_min || "--"}
                    <div>Min</div>
                  </div>
                )}
                <div className="flex items-center gap-x-1">
                  <span>
                    {renderEditableField(
                      getCurrentValue("max_phase_angle_alert"),
                      "max_phase_angle_alert"
                    )}
                  </span>
                  <span>°</span>
                </div>
                {editMode && (
                  <div className="flex flex-col items-center gap-x-1">
                    {minMaxRangeData?.max_phase_angle_alert_max || "--"}
                    <div>Max</div>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="text-xs">
              <div className="flex items-center gap-2">
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.max_phase_angle_fault_min || "--"}
                    <div>Min</div>
                  </div>
                )}
                <div className="flex items-center gap-x-1">
                  <span>
                    {renderEditableField(
                      getCurrentValue("max_phase_angle_fault"),
                      "max_phase_angle_fault"
                    )}
                  </span>
                  <span>°</span>
                </div>
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.max_phase_angle_fault_max || "--"}
                    <div>Max</div>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="text-xs">-</TableCell>
          </TableRow>

          {/* Over Temperature */}
          <TableRow>
            <TableCell className="font-medium text-gray-600 text-xs">
              Over Temperature
            </TableCell>
            <TableCell className="text-xs">
              <div className="flex items-center gap-2">
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.over_temperature_alert_min || "--"}
                    <div>Min</div>
                  </div>
                )}
                <div className="flex items-center gap-x-1">
                  <span>
                    {renderEditableField(
                      getCurrentValue("over_temperature_alert"),
                      "over_temperature_alert"
                    )}
                  </span>
                  <span>°C</span>
                </div>
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.over_temperature_alert_max || "--"}
                    <div>Max</div>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="text-xs">
              <div className="flex items-center gap-2">
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.over_temperature_fault_min || "--"}
                    <div>Min</div>
                  </div>
                )}
                <div className="flex items-center gap-x-1">
                  <span>
                    {renderEditableField(
                      getCurrentValue("over_temperature_fault"),
                      "over_temperature_fault"
                    )}
                  </span>
                  <span>°C</span>
                </div>
                {editMode && (
                  <div className="flex flex-col items-center">
                    {minMaxRangeData?.over_temperature_fault_max || "--"}
                    <div>Max</div>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="text-xs">-</TableCell>
          </TableRow>

          {/* Fault Detection */}
          <TableRow>
            <TableCell className="font-medium text-gray-600 text-xs">
              Fault Detection
            </TableCell>
            <TableCell className="text-xs">-</TableCell>
            <TableCell className="text-xs">
              <div className="flex items-center gap-2">
                {editMode ? (
                  <span className="flex items-center gap-4">
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="flt_en"
                        value={1}
                        checked={getCurrentValue("flt_en") === 1}
                        onChange={() => handleInputChange("flt_en", 1)}
                        className="cursor-pointer accent-green-500"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="flt_en"
                        value={0}
                        checked={getCurrentValue("flt_en") === 0}
                        onChange={() => handleInputChange("flt_en", 0)}
                        className="cursor-pointer accent-green-500"
                      />
                      <span>No</span>
                    </label>
                  </span>
                ) : (
                  <span
                    onDoubleClick={() => handleDoubleClick("flt_en")}
                    className="cursor-pointer"
                  >
                    {getCurrentValue("flt_en") === 1 ? "Yes" : "No"}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className="text-xs">-</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
