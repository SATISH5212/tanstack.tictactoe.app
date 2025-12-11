import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DeviceSettingsData, DeviceSettingsLimits, MotorSettings } from "src/lib/interfaces/core/settings";

interface MotorSettingsSectionProps {
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

export const MotorSettingsSection: React.FC<MotorSettingsSectionProps> = ({
  deviceSettingsData,
  getMotorValue,
  renderEditableField,
  editMode,
  minMaxRangeData,
}) => {
  if (!deviceSettingsData?.motor_specific_limits || deviceSettingsData.motor_specific_limits.length === 0) {
    return (
      <div className="p-4 border border-gray-200 rounded-md mt-3">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Motor Settings</h3>
        <div className="flex flex-col items-center justify-center h-full py-10">
          <h3 className="text-lg font-semibold text-black">No Data Available</h3>
          <p className="text-sm text-gray-500 mt-2">
            There are no motor settings to display at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-200 rounded-md mt-3">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Motor Settings</h3>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="text-black font-normal text-xs">Parameter</TableHead>
            <TableHead className="text-black font-normal text-xs">Alert</TableHead>
            <TableHead className="text-black font-normal text-xs">Fault</TableHead>
            <TableHead className="text-black font-normal text-xs">Recovery</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deviceSettingsData.motor_specific_limits.map((_, index) => (
            <React.Fragment key={`motor_${index}`}>
              <TableRow>
                <TableCell className="font-medium text-gray-600 text-xs">
                  Motor {index + 1} - Dry Run Protection
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-2">
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.dry_run_protection_alert_min || "--"}
                        <div>Min</div>
                      </div>
                    )}
                    <div className="flex items-center gap-x-1">
                      <span>
                        {renderEditableField(
                          getMotorValue(index, "dry_run_protection_alert"),
                          `motor_${index}_dry_run_protection_alert`,
                          true,
                          index,
                          "dry_run_protection_alert"
                        )}
                      </span>
                      <span>%</span>
                    </div>
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.dry_run_protection_alert_max || "--"}
                        <div>Max</div>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-2">
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.dry_run_protection_fault_min || "--"}
                        <div>Min</div>
                      </div>
                    )}
                    <div className="flex items-center gap-x-1">
                      <span>
                        {renderEditableField(
                          getMotorValue(index, "dry_run_protection_fault"),
                          `motor_${index}_dry_run_protection_fault`,
                          true,
                          index,
                          "dry_run_protection_fault"
                        )}
                      </span>
                      <span>%</span>
                    </div>
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.dry_run_protection_fault_max || "--"}
                        <div>Max</div>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs">-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-gray-600 text-xs">
                  Motor {index + 1} - Over Load
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-2">
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.over_load_alert_min || "--"}
                        <div>Min</div>
                      </div>
                    )}
                    <div className="flex items-center gap-x-1">
                      <span>
                        {renderEditableField(
                          getMotorValue(index, "over_load_alert"),
                          `motor_${index}_over_load_alert`,
                          true,
                          index,
                          "over_load_alert"
                        )}
                      </span>
                      <span>%</span>
                    </div>
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.over_load_alert_max || "--"}
                        <div>Max</div>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-2">
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.over_load_fault_min || "--"}
                        <div>Min</div>
                      </div>
                    )}
                    <div className="flex items-center gap-x-1">
                      <span>
                        {renderEditableField(
                          getMotorValue(index, "over_load_fault"),
                          `motor_${index}_over_load_fault`,
                          true,
                          index,
                          "over_load_fault"
                        )}
                      </span>
                      <span>%</span>
                    </div>
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.over_load_fault_max || "--"}
                        <div>Max</div>
                      </div>
                    )}
                    </div>
                  </TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-2">
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.over_load_recovery_min || "--"}
                        <div>Min</div>
                      </div>
                    )}
                    <div className="flex items-center gap-x-1">
                      <span>
                        {renderEditableField(
                          getMotorValue(index, "over_load_recovery"),
                          `motor_${index}_over_load_recovery`,
                          true,
                          index,
                          "over_load_recovery"
                        )}
                      </span>
                      <span>%</span>
                    </div>
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.over_load_recovery_max || "--"}
                        <div>Max</div>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-gray-600 text-xs">
                  Motor {index + 1} - Locked Rotor
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-2">
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.locked_router_alert_min || "--"}
                        <div>Min</div>
                      </div>
                    )}
                    <div className="flex items-center gap-x-1">
                      <span>
                        {renderEditableField(
                          getMotorValue(index, "locked_router_alert"),
                          `motor_${index}_locked_router_alert`,
                          true,
                          index,
                          "locked_router_alert"
                        )}
                      </span>
                      <span>%</span>
                    </div>
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.locked_router_alert_max || "--"}
                        <div>Max</div>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-2">
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.locked_router_fault_min || "--"}
                        <div>Min</div>
                      </div>
                    )}
                    <div className="flex items-center gap-x-1">
                      <span>
                        {renderEditableField(
                          getMotorValue(index, "locked_router_fault"),
                          `motor_${index}_locked_router_fault`,
                          true,
                          index,
                          "locked_router_fault"
                        )}
                      </span>
                      <span>%</span>
                    </div>
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.locked_router_fault_max || "--"}
                        <div>Max</div>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-2">
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.locked_router_recovery_min || "--"}
                        <div>Min</div>
                      </div>
                    )}
                    <div className="flex items-center gap-x-1">
                      <span>
                        {renderEditableField(
                          getMotorValue(index, "locked_router_recovery"),
                          `motor_${index}_locked_router_recovery`,
                          true,
                          index,
                          "locked_router_recovery"
                        )}
                      </span>
                      <span>%</span>
                    </div>
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.locked_router_recovery_max || "--"}
                        <div>Max</div>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-gray-600 text-xs">
                  Motor {index + 1} - Output Phase Failure
                </TableCell>
                <TableCell className="text-xs">-</TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-2">
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.output_phase_failure_min || "--"}
                        <div>Min</div>
                      </div>
                    )}
                    <div className="flex items-center gap-x-1">
                      <span>
                        {renderEditableField(
                          getMotorValue(index, "output_phase_failure"),
                          `motor_${index}_output_phase_failure`,
                          true,
                          index,
                          "output_phase_failure"
                        )}
                      </span>
                      <span>A</span>
                    </div>
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.output_phase_failure_max || "--"}
                        <div>Max</div>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs">-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-gray-600 text-xs">
                  Motor {index + 1} - Current Imbalance
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-2">
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.current_imbalance_alert_min || "--"}
                        <div>Min</div>
                      </div>
                    )}
                    <div className="flex items-center gap-x-1">
                      <span>
                        {renderEditableField(
                          getMotorValue(index, "current_imbalance_alert"),
                          `motor_${index}_current_imbalance_alert`,
                          true,
                          index,
                          "current_imbalance_alert"
                        )}
                      </span>
                      <span>%</span>
                    </div>
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.current_imbalance_alert_max || "--"}
                        <div>Max</div>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-2">
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.current_imbalance_fault_min || "--"}
                        <div>Min</div>
                      </div>
                    )}
                    <div className="flex items-center gap-x-1">
                      <span>
                        {renderEditableField(
                          getMotorValue(index, "current_imbalance_fault"),
                          `motor_${index}_current_imbalance_fault`,
                          true,
                          index,
                          "current_imbalance_fault"
                        )}
                      </span>
                      <span>%</span>
                    </div>
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.current_imbalance_fault_max || "--"}
                        <div>Max</div>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-2">
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.current_imbalance_recovery_min || "--"}
                        <div>Min</div>
                      </div>
                    )}
                    <div className="flex items-center gap-x-1">
                      <span>
                        {renderEditableField(
                          getMotorValue(index, "current_imbalance_recovery"),
                          `motor_${index}_current_imbalance_recovery`,
                          true,
                          index,
                          "current_imbalance_recovery"
                        )}
                      </span>
                      <span>%</span>
                    </div>
                    {editMode && (
                      <div className="flex flex-col items-center">
                        {minMaxRangeData?.current_imbalance_recovery_max || "--"}
                        <div>Max</div>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

    </div>
  );
};