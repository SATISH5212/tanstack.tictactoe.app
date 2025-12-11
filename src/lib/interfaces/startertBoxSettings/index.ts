import mqtt from "mqtt";
import { DeviceSettings, DeviceSettingsData, DeviceSettingsLimits } from "../core/settings";

export interface UseMQTTPublisherProps {
  client: mqtt.MqttClient | null;
  isConnected: boolean;
  deviceSettingsData: DeviceSettingsData | null;
  editedSettings: Partial<DeviceSettings>;
  minMaxRangeData: DeviceSettingsLimits | null | undefined;
  gateway?: string;
  gatewayData?: any;
  isTestDevice?: boolean;
  isGatewayTitle?: string;
  userGatewayTitle?: string;
  deviceId: string;
  sendSettings: (payload: {
    deviceId: string;
    payload: DeviceSettings;
  }) => void;
  setEditMode: (value: boolean) => void;
}