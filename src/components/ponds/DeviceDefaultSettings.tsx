import { allFields, CALIBRATION_FIELDS, DEVICE_SETTINGS_FIELDS } from "@/lib/constants/exportDeviceData";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useCallback, useState } from "react";
import {
  getPondBasedMotorsSettingsAPI,
  updatePondBasedMotorsSettingsAPI,
} from "src/lib/services/deviceses";
import BackArrow from "../icons/BackButton";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const DeviceDefaultSettings = () => {
  const isDefaultSettingsRoute = window.location.pathname.includes("/default-settings");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: motorSettingsData, refetch, isLoading } = useQuery({
    queryKey: ["motorSettings"],
    queryFn: async () => {
      const response = await getPondBasedMotorsSettingsAPI();
      if (!response.success) throw response;
      return response?.data?.data;
    },
  });

  const handleDoubleClick = useCallback(() => {
    if (!editMode) {
      setEditMode(true);
      setFormData({ ...motorSettingsData });
    }
  }, [editMode, motorSettingsData]);

  const handleInputChange = useCallback((field: string, value: string) => {
    const isValidNumber = /^\d+(\.\d+)?$/.test(value);
    setFormData((prev: any) => ({
      ...prev,
      [field]: isValidNumber ? parseFloat(value) : "",
    }));
  }, []);

  const buildPayload = useCallback(() => {
    const getFieldValue = (field: string) => {
      if (formData[field] !== undefined) {
        return formData[field] === "" ? null : formData[field];
      }
      return motorSettingsData[field];
    };



    return allFields.reduce((acc, field) => {
      acc[field] = getFieldValue(field);
      return acc;
    }, {} as any);
  }, [formData, motorSettingsData]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await updatePondBasedMotorsSettingsAPI(buildPayload());
      refetch();
      setEditMode(false);
      setFormData({});
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSaving(false);
    }
  }, [buildPayload, refetch]);

  const handleCancel = () => {
    setEditMode(false);
    setFormData({});
  };

  const renderEditableField = useCallback(
    (value: number | null | undefined, field: string) => {
      if (!editMode) {
        const displayValue = value != null ? value : "-";
        return (
          <span onDoubleClick={handleDoubleClick} className="cursor-pointer text-gray-800">
            {displayValue}
          </span>
        );
      }

      return (
        <Input
          type="number"
          value={formData[field] ?? ""}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="h-7 w-16 rounded border px-2 py-1 text-sm"
        />
      );
    },
    [editMode, formData, handleDoubleClick, handleInputChange]
  );

  const renderFaultDetectionField = useCallback(() => {
    if (!editMode) {
      const value = motorSettingsData?.fault_detection;
      return (
        <span onDoubleClick={handleDoubleClick} className="cursor-pointer text-gray-800">
          {value === 1 ? "Yes" : value === 0 ? "No" : "-"}
        </span>
      );
    }

    const isChecked = (val: number) =>
      formData.fault_detection === val ||
      (formData.fault_detection === undefined && motorSettingsData?.fault_detection === val);

    return (
      <div className="flex gap-4">
        {[{ label: "Yes", value: "1" }, { label: "No", value: "0" }].map(({ label, value }) => (
          <label key={value} className="flex items-center gap-1">
            <input
              type="radio"
              name="fault_detection"
              value={value}
              checked={isChecked(parseInt(value))}
              onChange={() => handleInputChange("fault_detection", value)}
              className="cursor-pointer accent-green-500 peer-hidden"
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    );
  }, [editMode, formData, motorSettingsData, handleDoubleClick, handleInputChange]);

  const renderDeviceSettingsRow = (config: any) => (
    <TableRow key={config.label}>
      <TableCell className="font-medium text-gray-600 text-xs">{config.label}</TableCell>
      <TableCell className="text-xs">
        {config.alert ? (
          <div className="flex items-center gap-x-1">
            {renderEditableField(motorSettingsData?.[config.alert], config.alert)}
            {config.unit && <span>{config.unit}</span>}
          </div>
        ) : "-"}
      </TableCell>
      <TableCell className="text-xs">
        {config.fault ? (
          <div className="flex items-center gap-x-1">
            {renderEditableField(motorSettingsData?.[config.fault], config.fault)}
            {config.unit && <span>{config.unit}</span>}
          </div>
        ) : "-"}
      </TableCell>
      <TableCell className="text-xs">
        {config.recovery ? (
          <div className="flex items-center gap-x-1">
            {renderEditableField(motorSettingsData?.[config.recovery], config.recovery)}
            {config.unit && <span>{config.unit}</span>}
          </div>
        ) : "-"}
      </TableCell>
    </TableRow>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-49px)] w-[70%] mx-auto flex flex-col font-inter py-2 text-xs ">
      <div className="flex justify-between items-center  shrink-0">
        <h2 className="flex flex-row items-center text-lg font-medium text-gray-800 gap-2">
          {isDefaultSettingsRoute && (
            <Button onClick={() => history.back()} className="bg-transparent hover:bg-transparent p-0 h-fit">
              <BackArrow className="!h-5 !w-6 text-black hover:bg-gray-100 rounded-md" />
            </Button>
          )}
          Settings
        </h2>
        {editMode && (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="text-smd 3xl:text-sm text-red-500 hover:text-red-500 hover:bg-transparent h-auto border border-none"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="text-smd 3xl:text-sm bg-green-500 text-white hover:bg-green-500 hover:text-white h-auto px-6 py-1 border border-none"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      <div className="py-1 flex flex-col flex-1 h-[calc(100vh-100px)] mt-1">

        <Tabs defaultValue="device-settings" className="w-full flex flex-col h-full">
          <div className="flex justify-between items-center mb-1 shrink-0 ">
            <TabsList className="bg-transparent !shadow-none gap-6">
              <TabsTrigger
                value="device-settings"
                className="text-sm font-semibold text-gray-600 data-[state=active]:text-orange-600 data-[state=active]:border-b-2 data-[state=active]:border-orange-400"
              >
                Device Settings
              </TabsTrigger>
              <TabsTrigger
                value="motor-calibration"
                className="text-sm font-semibold text-gray-600 data-[state=active]:text-orange-600 data-[state=active]:border-b-2 data-[state=active]:border-orange-400"
              >
                Motor Calibration Data
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto h-[calc(100vh-49px)]">
            <TabsContent value="device-settings" className="mt-0 h-full">
              <div className="flex flex-row w-full gap-4">
                <div className="w-1/2 p-4 border border-gray-200 rounded">
                  <h3 className="text-sm font-normal text-gray-700 mb-2">Motor Configuration</h3>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="text-black font-normal text-xs">Parameter</TableHead>
                        <TableHead className="text-black font-normal text-xs">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium text-gray-600 text-xs">FLC</TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-x-2">
                            {renderEditableField(motorSettingsData?.full_load_current, "full_load_current")}
                            <span>A</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="w-1/2 p-4 border border-gray-200 rounded-md ">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Timing Configuration</h3>

                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="text-black font-normal text-xs">Parameter</TableHead>
                        <TableHead className="text-black font-normal text-xs text-left">Value</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium text-gray-600 text-xs">
                          Auto Start Seed Time
                        </TableCell>
                        <TableCell className="text-left text-xs">
                          {renderEditableField(motorSettingsData?.seed_time, "seed_time")}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium text-gray-600 text-xs">
                          Auto Start Seed Offset
                        </TableCell>
                        <TableCell className="text-left text-xs">
                          {renderEditableField(
                            motorSettingsData?.start_timing_offset,
                            "start_timing_offset"
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-md mt-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Device Settings</h3>
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
                    {DEVICE_SETTINGS_FIELDS.map(renderDeviceSettingsRow)}
                    <TableRow>
                      <TableCell className="font-medium text-gray-600 text-xs">Fault Detection</TableCell>
                      <TableCell className="text-xs">-</TableCell>
                      <TableCell className="text-xs">{renderFaultDetectionField()}</TableCell>
                      <TableCell className="text-xs">-</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="motor-calibration" className="mt-0 h-full">
              <div className="p-4 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Motor Calibration Data</h3>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="text-black font-normal text-xs">Parameter</TableHead>
                      <TableHead className="text-black font-normal text-xs">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CALIBRATION_FIELDS.map(({ label, field }) => (
                      <TableRow key={field}>
                        <TableCell className="font-medium text-gray-600 text-xs">{label}</TableCell>
                        <TableCell className="text-xs">
                          {renderEditableField(motorSettingsData?.[field], field)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default DeviceDefaultSettings;