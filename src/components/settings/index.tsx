import { useCallback, useState } from "react";
import { Loader, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { StarterBoxSettingsProps } from "src/lib/interfaces/core/settings";
import formatUstToIST from "src/lib/helpers/timeFormat";
import {
  useDeviceSettings,
  useDeviceSettingsHistory,
} from "../starterBoxSettings/useDeviceSettings";
import { useMQTTConnection } from "../starterBoxSettings/useMqqtConnection";
import { useEditMode } from "../starterBoxSettings/useEditMode";
import { useMQTTPublisher } from "../starterBoxSettings/useMqqtPublisher";
import { EditableField } from "./SettingsEditableField";
import { validateInput } from "../starterBoxSettings/settingValidations";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "../ui/sheet";
import { SettingsSvg } from "../svg/SettingsSvg";
import { Button } from "../ui/button";
import StarterBoxSettingsLimits from "../StarterBoxSettingsLimits";
import StarterBoxSettingsHistory from "../StarterBoxSettingsHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { MotorConfigurationSection } from "./MotorConfigurationSection";
import { TimingConfigurationSection } from "./TimingConfigurationSection";
import { DeviceSettingsSection } from "./DeviceSettingsSection";
import { MotorSettingsSection } from "./MotorSettingsSection"; // Restored
import { MotorCalibrationSection } from "./MotorCalibrationSection";

export const StarterBoxSettings = ({
  isOpen,
  onClose,
  hideTrigger = false,
  hideTriggerOne = false,
  setShowSettings,
  gateway,
  deviceId,
  gatewayData,
  isTestDevice,
  isGatewayTitle,
  userGatewayTitle,
}: any) => {
  const device_id2 = deviceId;
  const [open, setOpen] = useState(false);
  const [internalClose, setInternalClose] = useState(false);
  const [activeTab, setActiveTab] = useState("device-settings");

  const searchParams = new URLSearchParams(location.search);
  const pageIndexParam = Number(searchParams.get("current_page")) || 1;
  const pageSizeParam = Number(searchParams.get("page_size")) || 15;

  const queryClient = useQueryClient();

  // Custom hooks
  const {
    deviceSettingsData,
    isFetchingDeviceSettings,
    isLoadingDeviceSettings,
    minMaxRangeData,
    refetchMinMax,
    sendSettings,
    apiCall,
  } = useDeviceSettings(device_id2, isOpen || open);

  const {
    allRecords,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useDeviceSettingsHistory(device_id2, apiCall, pageSizeParam);

  const { client, isConnected } = useMQTTConnection(isOpen || open);

  const {
    editMode,
    setEditMode,
    focusedField,
    editedSettings,
    motorData,
    getCurrentValue,
    getMotorValue,
    handleDoubleClick,
    handleInputChange,
    handleMotorInputChange,
    handleCancel,
  } = useEditMode(deviceSettingsData);

  const { handlePublish } = useMQTTPublisher({
    client,
    isConnected,
    deviceSettingsData,
    editedSettings,
    minMaxRangeData,
    gateway,
    gatewayData,
    isTestDevice,
    isGatewayTitle,
    userGatewayTitle,
    deviceId: device_id2,
    sendSettings,
    setEditMode,
  });

  const renderEditableField = useCallback(
    (
      value: any,
      field: string,
      isMotorField = false,
      motorIndex?: number,
      motorKey?: any
    ) => {
      return (
        <EditableField
          value={value ?? ""} 
          field={field}
          isMotorField={isMotorField}
          motorIndex={motorIndex}
          motorKey={motorKey}
          editMode={editMode}
          focusedField={focusedField}
          minMaxRangeData={minMaxRangeData}
          onDoubleClick={handleDoubleClick}
          onInputChange={handleInputChange}
          onMotorInputChange={handleMotorInputChange}
          validateInput={(input, field) =>
            validateInput(input, field, minMaxRangeData)
          }
        />
      );
    },
    [
      editMode,
      focusedField,
      minMaxRangeData,
      handleDoubleClick,
      handleInputChange,
      handleMotorInputChange,
    ]
  );

  const handleSheetOpenChange = useCallback(
    (state: boolean) => {
      setOpen(state);
      setInternalClose(false);
      setEditMode(false);
      if (state && device_id2) {
        queryClient.invalidateQueries({
          queryKey: ["device-Settings", device_id2],
        });
        queryClient.invalidateQueries({
          queryKey: ["min-max-range", device_id2],
        });
      }
    },
    [queryClient, device_id2, setEditMode]
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Sheet open={isOpen || open} onOpenChange={handleSheetOpenChange}>
      {!hideTrigger && (
        <SheetTrigger asChild>
          <button
            className="flex items-center gap-1 justify-start.5"
            onClick={() => setOpen(true)}
          >
            <SettingsSvg />
            <div className="text-title">Settings</div>
          </button>
        </SheetTrigger>
      )}

      <SheetContent className="bg-white min-w-full xl:min-w-custom_65per w-1/2 font-inter p-0 text-xs [&>button]:hidden overflow-auto">
        <SheetHeader className="flex flex-row items-center justify-between px-6 py-2 border-b sticky top-0 bg-white z-50 space-y-0 border">
          <h1 className="m-0 leading-tight text-sm 3xl:text-lg font-medium">
            Settings
            <span className="font-medium text-green-500">
              {deviceSettingsData?.starterBox?.title
                ? ` (${deviceSettingsData?.starterBox?.title})`
                : " "}
            </span>
          </h1>
          <Button
            variant="outline"
            className="text-center font-medium text-md text-black border border-gray-300 p-0 h-6 w-6 m-0"
            onClick={() => {
              setInternalClose(true);
              setOpen(false);
              setEditMode(false);
              setShowSettings && setShowSettings(false);
            }}
          >
            <X strokeWidth={3} />
          </Button>
        </SheetHeader>

        {isFetchingDeviceSettings || isLoadingDeviceSettings ? (
          <div className="flex items-center justify-center h-full">
            <Loader />
          </div>
        ) : !deviceSettingsData ? (
          <div className="flex flex-col items-center justify-center h-full py-10">
            <h3 className="text-lg font-semibold text-black">
              No Data Available
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Unable to fetch device settings. Please try again.
            </p>
          </div>
        ) : (
          <div className="pb-10 pt-4">
            <div className="flex items-center gap-3 justify-end mb-4 pr-4">
              {allRecords.length > 0 && (
                <div
                  className={`py-1 px-4 rounded-full ${
                    allRecords[0]?.is_new_configuration_saved === 1
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  <div className="text-xxs 3xl:text-smd text-black/70 font-medium">
                    {formatUstToIST(allRecords[0]?.updated_at ?? "")}
                  </div>
                </div>
              )}
              <StarterBoxSettingsLimits
                deviceId={device_id2 as string}
                hideTriggerOne={hideTriggerOne}
                isLoading={isLoading}
                minMaxRangeData={minMaxRangeData}
                isFetching={isFetching}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                refetch={refetchMinMax}
                setSettingsEditMode={setEditMode}
              />
              <StarterBoxSettingsHistory
                hideTriggerOne={hideTriggerOne}
                isLoading={isLoading}
                allRecords={allRecords}
                isFetching={isFetching}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                setEditMode={setEditMode}
              />
            </div>

            <Tabs
              className="w-full"
              value={activeTab}
              onValueChange={handleTabChange}
              defaultValue="device-settings"
            >
              <TabsList className="bg-transparent !shadow-none">
                <TabsTrigger
                  value="device-settings"
                  className="text-sm font-semibold text-gray-600 data-[state=active]:text-orange-600 data-[state=active]:border-b-2 data-[state=active]:border-orange-600 px-4"
                >
                  Device Settings
                </TabsTrigger>
                <TabsTrigger
                  value="motor-calibration"
                  className="text-sm font-semibold text-gray-600 data-[state=active]:text-orange-600 data-[state=active]:border-b-2 data-[state=active]:border-orange-600 px-4"
                >
                  Motor Calibration Data
                </TabsTrigger>
              </TabsList>

              <TabsContent value="device-settings" className="mx-4">
                <MotorConfigurationSection
                  deviceSettingsData={deviceSettingsData}
                  getMotorValue={getMotorValue}
                  renderEditableField={renderEditableField}
                  editMode={editMode}
                  minMaxRangeData={minMaxRangeData}
                />
                <TimingConfigurationSection
                  getCurrentValue={getCurrentValue}
                  renderEditableField={renderEditableField}
                  editMode={editMode}
                  minMaxRangeData={minMaxRangeData}
                />
                <DeviceSettingsSection
                  deviceSettingsData={deviceSettingsData}
                  getCurrentValue={getCurrentValue}
                  renderEditableField={renderEditableField}
                  editMode={editMode}
                  minMaxRangeData={minMaxRangeData}
                  handleInputChange={handleInputChange}
                  handleDoubleClick={handleDoubleClick}
                />
                <MotorSettingsSection
                  deviceSettingsData={deviceSettingsData}
                  getMotorValue={getMotorValue}
                  renderEditableField={renderEditableField}
                  editMode={editMode}
                  minMaxRangeData={minMaxRangeData}
                />
              </TabsContent>

              <TabsContent value="motor-calibration" className="mx-4">
                <MotorCalibrationSection
                  getCurrentValue={getCurrentValue}
                  renderEditableField={renderEditableField}
                  editMode={editMode}
                  minMaxRangeData={minMaxRangeData}
                />
              </TabsContent>
            </Tabs>

            {editMode && (
              <div className="flex justify-end gap-2 mt-3 px-4">
                <Button
                  onClick={handlePublish}
                  className="bg-green-100 hover:bg-green-50 font-normal text-xs 3xl:text-sm text-green-500 h-auto py-1.5 px-5 rounded-full"
                >
                  Save
                </Button>
                <Button
                  onClick={handleCancel}
                  className="bg-red-100 hover:bg-red-50 font-normal text-xs 3xl:text-sm text-red-500 h-auto py-1.5 px-5 rounded-full"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default StarterBoxSettings;
