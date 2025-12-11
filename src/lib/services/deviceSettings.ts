import { $fetch } from "../fetch";
import { SettingsHistoryQueryParams } from "../interfaces/core/settings";

export const getAllDeviceSettingsAPI = async (device_id: string) => {
  try {
    return await $fetch.get(`/starter-settings/${device_id}`);
  } catch (err) {
    throw err;
  }
};
export const getMinMaxRangeAPI = async (device_id: string) => {
  try {
    return await $fetch.get(`/starter-settings/limits/${device_id}`);
  } catch (err) {
    throw err;
  }
};
export const updateMinMaxRangeAPI = async (device_id: string, payload: any) => {
  try {
    return await $fetch.patch(`/starter-settings/limits/${device_id}`, payload);
  } catch (err) {
    throw err;
  }
};

export const sendDeviceSettingsAPI = async (device_id: string, payloadString: any) => {
  try {
    return await $fetch.post(`/starter-settings/${device_id}`, payloadString);
  } catch (err) {
    throw err;
  }
};

export const getDeviceSettingLogsAPI = async ({
  starter_id,
  pageIndex,
  pageSize,
}: SettingsHistoryQueryParams) => {
  try {
    const queryParams = {
      page: pageIndex,
      limit: pageSize,

    };
    return await $fetch.get(`/starter-settings/${starter_id}/history`, queryParams);
  } catch (err) {
    throw err;
  }
};