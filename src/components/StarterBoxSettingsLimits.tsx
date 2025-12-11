import { useCallback, useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "./ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import SettingsIcon from "./icons/devices/SettingsIcon";
import { StarterBoxSettingsLimitsProps } from "src/lib/interfaces/core/settings";
import { updateMinMaxRangeAPI } from "src/lib/services/deviceSettings";
interface DeviceSettings {
  [key: string]: number | null;
}

const StarterBoxSettingsLimits = ({
  isOpen,
  onClose,
  hideTriggerOne = false,
  minMaxRangeData,
  isLoading,
  isFetching,
  deviceId,
  refetch,
  setSettingsEditMode,
}: StarterBoxSettingsLimitsProps & { deviceId: string }) => {
  const [open, setOpen] = useState(false);
  const [internalClose, setInternalClose] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formData, setFormData] = useState<DeviceSettings>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSheetOpenChange = (state: boolean) => {
    if (!state && !internalClose) {
      onClose?.();
      setEditMode(false);
      setFormData({});
    }
    setOpen(state);
    setInternalClose(false);
  };

  const handleDoubleClick = useCallback(
    (field: string) => {
      setEditMode(true);
      setFocusedField(field);
      setFormData({ ...minMaxRangeData });
    },
    [minMaxRangeData]
  );

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === "" ? null : Number(value),
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const payload: DeviceSettings = {
        u_gain_r_min:
          formData.u_gain_r_min ?? minMaxRangeData?.u_gain_r_min ?? null,
        u_gain_r_max:
          formData.u_gain_r_max ?? minMaxRangeData?.u_gain_r_max ?? null,
        u_gain_y_min:
          formData.u_gain_y_min ?? minMaxRangeData?.u_gain_y_min ?? null,
        u_gain_y_max:
          formData.u_gain_y_max ?? minMaxRangeData?.u_gain_y_max ?? null,
        u_gain_b_min:
          formData.u_gain_b_min ?? minMaxRangeData?.u_gain_b_min ?? null,
        u_gain_b_max:
          formData.u_gain_b_max ?? minMaxRangeData?.u_gain_b_max ?? null,
        i_gain_r_min:
          formData.i_gain_r_min ?? minMaxRangeData?.i_gain_r_min ?? null,
        i_gain_r_max:
          formData.i_gain_r_max ?? minMaxRangeData?.i_gain_r_max ?? null,
        i_gain_y_min:
          formData.i_gain_y_min ?? minMaxRangeData?.i_gain_y_min ?? null,
        i_gain_y_max:
          formData.i_gain_y_max ?? minMaxRangeData?.i_gain_y_max ?? null,
        i_gain_b_min:
          formData.i_gain_b_min ?? minMaxRangeData?.i_gain_b_min ?? null,
        i_gain_b_max:
          formData.i_gain_b_max ?? minMaxRangeData?.i_gain_b_max ?? null,
        current_multiplier_min:
          formData.current_multiplier_min ??
          minMaxRangeData?.current_multiplier_min ??
          null,
        current_multiplier_max:
          formData.current_multiplier_max ??
          minMaxRangeData?.current_multiplier_max ??
          null,
        input_phase_failure_min:
          formData.input_phase_failure_min ??
          minMaxRangeData?.input_phase_failure_min ??
          null,
        input_phase_failure_max:
          formData.input_phase_failure_max ??
          minMaxRangeData?.input_phase_failure_max ??
          null,
        low_voltage_fault_min:
          formData.low_voltage_fault_min ??
          minMaxRangeData?.low_voltage_fault_min ??
          null,
        low_voltage_fault_max:
          formData.low_voltage_fault_max ??
          minMaxRangeData?.low_voltage_fault_max ??
          null,
        high_voltage_fault_min:
          formData.high_voltage_fault_min ??
          minMaxRangeData?.high_voltage_fault_min ??
          null,
        high_voltage_fault_max:
          formData.high_voltage_fault_max ??
          minMaxRangeData?.high_voltage_fault_max ??
          null,
        voltage_imbalance_fault_min:
          formData.voltage_imbalance_fault_min ??
          minMaxRangeData?.voltage_imbalance_fault_min ??
          null,
        voltage_imbalance_fault_max:
          formData.voltage_imbalance_fault_max ??
          minMaxRangeData?.voltage_imbalance_fault_max ??
          null,
        min_phase_angle_fault_min:
          formData.min_phase_angle_fault_min ??
          minMaxRangeData?.min_phase_angle_fault_min ??
          null,
        min_phase_angle_fault_max:
          formData.min_phase_angle_fault_max ??
          minMaxRangeData?.min_phase_angle_fault_max ??
          null,
        max_phase_angle_fault_min:
          formData.max_phase_angle_fault_min ??
          minMaxRangeData?.max_phase_angle_fault_min ??
          null,
        max_phase_angle_fault_max:
          formData.max_phase_angle_fault_max ??
          minMaxRangeData?.max_phase_angle_fault_max ??
          null,
        min_frequency_fault_min:
          formData.min_frequency_fault_min ??
          minMaxRangeData?.min_frequency_fault_min ??
          null,
        min_frequency_fault_max:
          formData.min_frequency_fault_max ??
          minMaxRangeData?.min_frequency_fault_max ??
          null,
        max_frequency_fault_min:
          formData.max_frequency_fault_min ??
          minMaxRangeData?.max_frequency_fault_min ??
          null,
        max_frequency_fault_max:
          formData.max_frequency_fault_max ??
          minMaxRangeData?.max_frequency_fault_max ??
          null,
        over_temperature_fault_min:
          formData.over_temperature_fault_min ??
          minMaxRangeData?.over_temperature_fault_min ??
          null,
        over_temperature_fault_max:
          formData.over_temperature_fault_max ??
          minMaxRangeData?.over_temperature_fault_max ??
          null,
        phase_failure_alert_min:
          formData.phase_failure_alert_min ??
          minMaxRangeData?.phase_failure_alert_min ??
          null,
        phase_failure_alert_max:
          formData.phase_failure_alert_max ??
          minMaxRangeData?.phase_failure_alert_max ??
          null,
        low_voltage_alert_min:
          formData.low_voltage_alert_min ??
          minMaxRangeData?.low_voltage_alert_min ??
          null,
        low_voltage_alert_max:
          formData.low_voltage_alert_max ??
          minMaxRangeData?.low_voltage_alert_max ??
          null,
        high_voltage_alert_min:
          formData.high_voltage_alert_min ??
          minMaxRangeData?.high_voltage_alert_min ??
          null,
        high_voltage_alert_max:
          formData.high_voltage_alert_max ??
          minMaxRangeData?.high_voltage_alert_max ??
          null,
        voltage_imbalance_alert_min:
          formData.voltage_imbalance_alert_min ??
          minMaxRangeData?.voltage_imbalance_alert_min ??
          null,
        voltage_imbalance_alert_max:
          formData.voltage_imbalance_alert_max ??
          minMaxRangeData?.voltage_imbalance_alert_max ??
          null,
        min_phase_angle_alert_min:
          formData.min_phase_angle_alert_min ??
          minMaxRangeData?.min_phase_angle_alert_min ??
          null,
        min_phase_angle_alert_max:
          formData.min_phase_angle_alert_max ??
          minMaxRangeData?.min_phase_angle_alert_max ??
          null,
        max_phase_angle_alert_min:
          formData.max_phase_angle_alert_min ??
          minMaxRangeData?.max_phase_angle_alert_min ??
          null,
        max_phase_angle_alert_max:
          formData.max_phase_angle_alert_max ??
          minMaxRangeData?.max_phase_angle_alert_max ??
          null,
        min_frequency_alert_min:
          formData.min_frequency_alert_min ??
          minMaxRangeData?.min_frequency_alert_min ??
          null,
        min_frequency_alert_max:
          formData.min_frequency_alert_max ??
          minMaxRangeData?.min_frequency_alert_max ??
          null,
        max_frequency_alert_min:
          formData.max_frequency_alert_min ??
          minMaxRangeData?.max_frequency_alert_min ??
          null,
        max_frequency_alert_max:
          formData.max_frequency_alert_max ??
          minMaxRangeData?.max_frequency_alert_max ??
          null,
        over_temperature_alert_min:
          formData.over_temperature_alert_min ??
          minMaxRangeData?.over_temperature_alert_min ??
          null,
        over_temperature_alert_max:
          formData.over_temperature_alert_max ??
          minMaxRangeData?.over_temperature_alert_max ??
          null,
        low_voltage_recovery_min:
          formData.low_voltage_recovery_min ??
          minMaxRangeData?.low_voltage_recovery_min ??
          null,
        low_voltage_recovery_max:
          formData.low_voltage_recovery_max ??
          minMaxRangeData?.low_voltage_recovery_max ??
          null,
        high_voltage_recovery_min:
          formData.high_voltage_recovery_min ??
          minMaxRangeData?.high_voltage_recovery_min ??
          null,
        high_voltage_recovery_max:
          formData.high_voltage_recovery_max ??
          minMaxRangeData?.high_voltage_recovery_max ??
          null,
        seed_time_min:
          formData.seed_time_min ?? minMaxRangeData?.seed_time_min ?? null,
        seed_time_max:
          formData.seed_time_max ?? minMaxRangeData?.seed_time_max ?? null,
        start_timing_offset_min:
          formData.start_timing_offset_min ??
          minMaxRangeData?.start_timing_offset_min ??
          null,
        start_timing_offset_max:
          formData.start_timing_offset_max ??
          minMaxRangeData?.start_timing_offset_max ??
          null,
        dry_run_protection_fault_min:
          formData.dry_run_protection_fault_min ??
          minMaxRangeData?.dry_run_protection_fault_min ??
          null,
        dry_run_protection_fault_max:
          formData.dry_run_protection_fault_max ??
          minMaxRangeData?.dry_run_protection_fault_max ??
          null,
        over_load_fault_min:
          formData.over_load_fault_min ??
          minMaxRangeData?.over_load_fault_min ??
          null,
        over_load_fault_max:
          formData.over_load_fault_max ??
          minMaxRangeData?.over_load_fault_max ??
          null,
        locked_router_fault_min:
          formData.locked_router_fault_min ??
          minMaxRangeData?.locked_router_fault_min ??
          null,
        locked_router_fault_max:
          formData.locked_router_fault_max ??
          minMaxRangeData?.locked_router_fault_max ??
          null,
        output_phase_failure_min:
          formData.output_phase_failure_min ??
          minMaxRangeData?.output_phase_failure_min ??
          null,
        output_phase_failure_max:
          formData.output_phase_failure_max ??
          minMaxRangeData?.output_phase_failure_max ??
          null,
        current_imbalance_fault_min:
          formData.current_imbalance_fault_min ??
          minMaxRangeData?.current_imbalance_fault_min ??
          null,
        current_imbalance_fault_max:
          formData.current_imbalance_fault_max ??
          minMaxRangeData?.current_imbalance_fault_max ??
          null,
        dry_run_protection_alert_min:
          formData.dry_run_protection_alert_min ??
          minMaxRangeData?.dry_run_protection_alert_min ??
          null,
        dry_run_protection_alert_max:
          formData.dry_run_protection_alert_max ??
          minMaxRangeData?.dry_run_protection_alert_max ??
          null,
        over_load_alert_min:
          formData.over_load_alert_min ??
          minMaxRangeData?.over_load_alert_min ??
          null,
        over_load_alert_max:
          formData.over_load_alert_max ??
          minMaxRangeData?.over_load_alert_max ??
          null,
        locked_router_alert_min:
          formData.locked_router_alert_min ??
          minMaxRangeData?.locked_router_alert_min ??
          null,
        locked_router_alert_max:
          formData.locked_router_alert_max ??
          minMaxRangeData?.locked_router_alert_max ??
          null,
        current_imbalance_alert_min:
          formData.current_imbalance_alert_min ??
          minMaxRangeData?.current_imbalance_alert_min ??
          null,
        current_imbalance_alert_max:
          formData.current_imbalance_alert_max ??
          minMaxRangeData?.current_imbalance_alert_max ??
          null,
        full_load_current_min:
          formData.full_load_current_min ??
          minMaxRangeData?.full_load_current_min ??
          null,
        full_load_current_max:
          formData.full_load_current_max ??
          minMaxRangeData?.full_load_current_max ??
          null,
        over_load_recovery_min:
          formData.over_load_recovery_min ??
          minMaxRangeData?.over_load_recovery_min ??
          null,
        over_load_recovery_max:
          formData.over_load_recovery_max ??
          minMaxRangeData?.over_load_recovery_max ??
          null,
        locked_router_recovery_min:
          formData.locked_router_recovery_min ??
          minMaxRangeData?.locked_router_recovery_min ??
          null,
        locked_router_recovery_max:
          formData.locked_router_recovery_max ??
          minMaxRangeData?.locked_router_recovery_max ??
          null,
        current_imbalance_recovery_min:
          formData.current_imbalance_recovery_min ??
          minMaxRangeData?.current_imbalance_recovery_min ??
          null,
        current_imbalance_recovery_max:
          formData.current_imbalance_recovery_max ??
          minMaxRangeData?.current_imbalance_recovery_max ??
          null,
      };

      await updateMinMaxRangeAPI(deviceId, payload);
      await refetch?.();
      setEditMode(false);
      setFormData({});
      setFocusedField(null);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSaving(false);
    }
  }, [deviceId, formData, minMaxRangeData, refetch]);

  const handleCancel = useCallback(() => {
    setEditMode(false);
    setFormData({});
    setFocusedField(null);
  }, []);

  const renderEditableField = useCallback(
    (value: number | null | undefined, field: string) => {
      if (!editMode) {
        return (
          <span
            onDoubleClick={() => handleDoubleClick(field)}
            className="cursor-pointer border w-full block py-1 "
          >
            {value ?? "-"}
          </span>
        );
      }

      return (
        <Input
          type="number"
          value={
            formData[field] !== undefined && formData[field] !== null
              ? formData[field]
              : ""
          }
          onChange={(e) => {
            const value = e.target.value;
            if (!/^\d*$/.test(value)) {
              return;
            }
            if (value.length > 5) {
              return;
            }
            handleInputChange(field, value);
          }}
          onWheel={(e) => (e.target as HTMLInputElement).blur()}
          onKeyDown={(e) => {
            if ([".", "e", "+", "-"].includes(e.key)) {
              e.preventDefault(); 
            }
          }}
          className="w-16 h-7 rounded border px-0.5 py-1 text-sm"
          autoFocus={focusedField === field}
        />
      );
    },
    [editMode, focusedField, formData, handleDoubleClick, handleInputChange]
  );

  return (
    <div>
      <Sheet open={isOpen || open} onOpenChange={handleSheetOpenChange}>
        {!hideTriggerOne && (
          <SheetTrigger asChild>
            <Button
              className="flex h-auto items-center gap-1.5 rounded-full border-none bg-[#828282] px-3 py-1 text-xs text-white hover:bg-[#828282] 3xl:text-sm [&_svg]:size-3"
              onClick={() => {
                setOpen(true);
                setSettingsEditMode(false);
              }}
            >
              <SettingsIcon className="text-white" />
              <span>Change Settings Limits</span>
            </Button>
          </SheetTrigger>
        )}
        <SheetContent className="w-1/2 min-w-[500px] bg-white py-1 font-inter text-xs 2xl:min-w-[500px] [&>button]:hidden">
          <SheetHeader className="sticky top-0 z-50 mb-4 flex flex-row items-center justify-between border-b bg-white px-0 py-2 space-y-0">
            <h1 className="m-0 text-sm font-medium leading-tight 3xl:text-lg">
              Change Settings Limits
            </h1>
            <Button
              variant="outline"
               className="w-6 h-6 cursor-pointer text-red-500 p-1 rounded-full hover:bg-red-100 hover:text-red-600"
              onClick={() => {
                setInternalClose(true);
                setOpen(false);
              }}
            >
              <X />
            </Button>
          </SheetHeader>

          <div className="space-y-3 overflow-y-auto pb-4 pt-0 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 h-[calc(100vh-130px)]">
            <Table className=" ">
              <TableHeader className="sticky top-0 z-10 bg-gray-100">
                <TableRow className="bg-gray-100">
                  <TableHead className=" bg-gray-100 text-center font-medium text-smd ">
                    S.no
                  </TableHead>
                  <TableHead className=" bg-gray-100 text-center font-medium text-smd ">
                    Parameter Name
                  </TableHead>
                  <TableHead className=" bg-gray-100 text-center font-medium text-smd ">
                    Min Value
                  </TableHead>
                  <TableHead className=" bg-gray-100 text-center font-medium text-smd ">
                    Max Value
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    1
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    U gain R for Atmel Calibration
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.u_gain_r_min,
                      "u_gain_r_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.u_gain_r_max,
                      "u_gain_r_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    2
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    U gain Y for Atmel Calibration
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.u_gain_y_min,
                      "u_gain_y_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.u_gain_y_max,
                      "u_gain_y_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    3
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    U gain B for Atmel Calibration
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.u_gain_b_min,
                      "u_gain_b_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.u_gain_b_max,
                      "u_gain_b_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    4
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    I gain R for Atmel Calibration
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.i_gain_r_min,
                      "i_gain_r_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.i_gain_r_max,
                      "i_gain_r_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    5
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    I gain Y for Atmel Calibration
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.i_gain_y_min,
                      "i_gain_y_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.i_gain_y_max,
                      "i_gain_y_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    6
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    I gain B for Atmel Calibration
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.i_gain_b_min,
                      "i_gain_b_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.i_gain_b_max,
                      "i_gain_b_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    7
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Current Sense ADC Multiplication Value
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.current_multiplier_min,
                      "current_multiplier_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.current_multiplier_max,
                      "current_multiplier_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    8
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Full Load Current
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.full_load_current_min,
                      "full_load_current_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.full_load_current_max,
                      "full_load_current_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    9
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Dry Run Protection Fault Threshold
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.dry_run_protection_fault_min,
                      "dry_run_protection_fault_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.dry_run_protection_fault_max,
                      "dry_run_protection_fault_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    10
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Over Load Fault Threshold
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.over_load_fault_min,
                      "over_load_fault_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.over_load_fault_max,
                      "over_load_fault_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    11
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Locked Router Fault
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.locked_router_fault_min,
                      "locked_router_fault_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.locked_router_fault_max,
                      "locked_router_fault_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    12
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Output Phase Failure
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.output_phase_failure_min,
                      "output_phase_failure_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.output_phase_failure_max,
                      "output_phase_failure_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    13
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Current Imbalance Fault Ratio
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.current_imbalance_fault_min,
                      "current_imbalance_fault_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.current_imbalance_fault_max,
                      "current_imbalance_fault_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    14
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Dry Run Protection Alert Threshold
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.dry_run_protection_alert_min,
                      "dry_run_protection_alert_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.dry_run_protection_alert_max,
                      "dry_run_protection_alert_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    15
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Over Load Alert Threshold
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.over_load_alert_min,
                      "over_load_alert_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.over_load_alert_max,
                      "over_load_alert_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    16
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Locked Router Alert
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.locked_router_alert_min,
                      "locked_router_alert_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.locked_router_alert_max,
                      "locked_router_alert_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    17
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Current Imbalance Alert Ratio
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.current_imbalance_alert_min,
                      "current_imbalance_alert_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.current_imbalance_alert_max,
                      "current_imbalance_alert_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    18
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Input Phase Failure
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.input_phase_failure_min,
                      "input_phase_failure_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.input_phase_failure_max,
                      "input_phase_failure_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    19
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Low Voltage Fault Threshold
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.low_voltage_fault_min,
                      "low_voltage_fault_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.low_voltage_fault_max,
                      "low_voltage_fault_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    20
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    High Voltage Fault Threshold
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.high_voltage_fault_min,
                      "high_voltage_fault_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.high_voltage_fault_max,
                      "high_voltage_fault_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    21
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Voltage Imbalance Fault Threshold
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.voltage_imbalance_fault_min,
                      "voltage_imbalance_fault_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.voltage_imbalance_fault_max,
                      "voltage_imbalance_fault_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    22
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Minimum Phase Angle for Fault
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.min_phase_angle_fault_min,
                      "min_phase_angle_fault_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.min_phase_angle_fault_max,
                      "min_phase_angle_fault_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    23
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Maximum Phase Angle for Fault
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.max_phase_angle_fault_min,
                      "max_phase_angle_fault_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.max_phase_angle_fault_max,
                      "max_phase_angle_fault_max"
                    )}
                  </TableCell>
                </TableRow>

                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    24
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Over Temperature
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.over_temperature_alert_min,
                      "over_temperature_alert_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.over_temperature_alert_max,
                      "over_temperature_alert_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    25
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Phase Failure Alert Value
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.phase_failure_alert_min,
                      "phase_failure_alert_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.phase_failure_alert_max,
                      "phase_failure_alert_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    26
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    High Voltage Alert Value
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.high_voltage_alert_min,
                      "high_voltage_alert_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.high_voltage_alert_max,
                      "high_voltage_alert_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    27
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Minimum Phase Angle Alert Value
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.min_phase_angle_alert_min,
                      "min_phase_angle_alert_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.min_phase_angle_alert_max,
                      "min_phase_angle_alert_max"
                    )}
                  </TableCell>
                </TableRow>

                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    28
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Over Temperature Alert
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.over_temperature_alert_min,
                      "over_temperature_alert_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.over_temperature_alert_max,
                      "over_temperature_alert_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    29
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Low Voltage Alert Value
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.low_voltage_alert_min,
                      "low_voltage_alert_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.low_voltage_alert_max,
                      "low_voltage_alert_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    30
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Voltage Imbalance Alert Value
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.voltage_imbalance_alert_min,
                      "voltage_imbalance_alert_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.voltage_imbalance_alert_max,
                      "voltage_imbalance_alert_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    31
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Maximum Phase Angle Alert Value
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.max_phase_angle_alert_min,
                      "max_phase_angle_alert_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.max_phase_angle_alert_max,
                      "max_phase_angle_alert_max"
                    )}
                  </TableCell>
                </TableRow>

                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    32
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Seed Time
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.seed_time_min,
                      "seed_time_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.seed_time_max,
                      "seed_time_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    33
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Seed Offset
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.start_timing_offset_min,
                      "start_timing_offset_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.start_timing_offset_max,
                      "start_timing_offset_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    34
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Low Voltage Recovery
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.low_voltage_recovery_min,
                      "low_voltage_recovery_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.low_voltage_recovery_max,
                      "low_voltage_recovery_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    35
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    High Voltage Recovery
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.high_voltage_recovery_min,
                      "high_voltage_recovery_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.high_voltage_recovery_max,
                      "high_voltage_recovery_max"
                    )}
                  </TableCell>
                </TableRow>

                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    36
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Over Load Recovery
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.over_load_recovery_min,
                      "over_load_recovery_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.over_load_recovery_max,
                      "over_load_recovery_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    37
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Locked Router Recovery
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.locked_router_recovery_min,
                      "locked_router_recovery_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.locked_router_recovery_max,
                      "locked_router_recovery_max"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    37
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-left">
                    Current Imbalance Recovery
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.current_imbalance_recovery_min,
                      "current_imbalance_recovery_min"
                    )}
                  </TableCell>
                  <TableCell className=" text-xs 3xl:text-smd  text-center">
                    {renderEditableField(
                      minMaxRangeData?.current_imbalance_recovery_max,
                      "current_imbalance_recovery_max"
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          {editMode && (
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="text-smd 3xl:text-sm text-red-500 hover:text-red-500 hover:bg-transparent h-auto "
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="text-smd 3xl:text-sm bg-green-500 text-white hover:bg-green-500 hover:text-white h-auto px-6 py-1  border-none "
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default StarterBoxSettingsLimits;
