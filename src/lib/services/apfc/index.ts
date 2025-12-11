import { $fetch2 } from "src/lib/fetch";

export const getAllApfcDevicesAPI = async (queryParams: any) => {
  try {
    const response = await $fetch2.get(`/devices`, queryParams);
    return response;
  } catch (err) {
    throw err;
  }
};
export const getAllApfcUsersAPI = async (queryParams: any) => {
  try {
    const response = await $fetch2.get(`/users`, queryParams);
    return response;
  } catch (err) {
    throw err;
  }
};
//assing user api
export const addApfcAssignUserAPI = async (payload: any, apfc_id: any) => {
  try {
    const response = await $fetch2.patch(
      `/devices/${apfc_id}/assign-user`,
      payload
    );

    return response;
  } catch (err) {
    throw err;
  }
};
//delete assigned user
export const deleteApfcAssignedUserAPI = async (apfc_id: any) => {
  try {
    const response = await $fetch2.delete(`/devices/${apfc_id}/user`);

    return response;
  } catch (err) {
    throw err;
  }
};
export const fetchUsersAPI = async () => {
  try {
    const response = await $fetch2.get(`/users/drop-down`);

    return response;
  } catch (err) {
    throw err;
  }
};

export const getSingleUserApfcAPI = async (queryParams: any, user_id: any) => {
  try {
    const response = await $fetch2.get(
      `/users/${user_id}/devices`,
      queryParams
    );
    return response;
  } catch (err) {
    throw err;
  }
};
// deleteApfcDeviceAPI;
export const deleteApfcDeviceAPI = async (apfc_id: any) => {
  try {
    const response = await $fetch2.delete(`/devices/${apfc_id}`);
    return response;
  } catch (err) {
    throw err;
  }
};
export const getLevel1DeviceSettingsAPI = async (apfc_id: any) => {
  try {
    const response = await $fetch2.get(`/devices/${apfc_id}/level1-settings`);
    return response;
  } catch (err) {
    throw err;
  }
};
export const getLevel2DeviceSettingsAPI = async (apfc_id: any) => {
  try {
    const response = await $fetch2.get(`/devices/${apfc_id}/level2-settings`);
    return response;
  } catch (err) {
    throw err;
  }
};
export const getLevel3DeviceSettingsAPI = async (apfc_id: any) => {
  try {
    const response = await $fetch2.get(`/devices/${apfc_id}/level3-settings`);
    return response;
  } catch (err) {
    throw err;
  }
};
export const getfanDeviceSettingsAPI = async (apfc_id: any) => {
  try {
    const response = await $fetch2.get(`/devices/${apfc_id}/fan-settings`);
    return response;
  } catch (err) {
    throw err;
  }
};

export const addLeve1DeviceSettingsAPI = async (apfc_id: any, payload: any) => {
  try {
    const response = await $fetch2.patch(
      `/devices/${apfc_id}/level1-settings`,
      payload
    );
    return response;
  } catch (err) {
    throw err;
  }
};
export const addLeve2DeviceSettingsAPI = async (apfc_id: any, payload: any) => {
  try {
    const response = await $fetch2.patch(
      `/devices/${apfc_id}/level2-settings`,
      payload
    );
    return response;
  } catch (err) {
    throw err;
  }
};
export const addLeve3DeviceSettingsAPI = async (apfc_id: any, payload: any) => {
  try {
    const response = await $fetch2.patch(
      `/devices/${apfc_id}/level3-settings`,
      payload
    );
    return response;
  } catch (err) {
    throw err;
  }
};
export const addfanDeviceSettingsAPI = async (apfc_id: any, payload: any) => {
  try {
    const response = await $fetch2.patch(
      `/devices/${apfc_id}/fan-settings`,
      payload
    );
    return response;
  } catch (err) {
    throw err;
  }
};

export const getSingleApfcDeviceDetailsAPI = async (apfc_id: any) => {
  try {
    const response = await $fetch2.get(`/devices/${apfc_id}/parameters`);

    return response;
  } catch (err) {
    throw err;
  }
};
export const getDeviceDataWithMinuteParamatersAPI = async (
  apfc_id: any,
  queryParams: any
) => {
  try {
    const response = await $fetch2.get(
      `/devices/${apfc_id}/device-params/minute-wise`,
      queryParams
    );

    return response;
  } catch (err) {
    throw err;
  }
};
export const addApfcDeviceAPI = async (payload: any) => {
  try {
    const response = await $fetch2.post(`/devices`, payload);

    return response;
  } catch (err) {
    throw err;
  }
};

export const UpdateApfcDeviceAPI = async (apfc_id: any, payload: any) => {
  try {
    const response = await $fetch2.patch(`/devices/${apfc_id}`, payload);

    return response;
  } catch (err) {
    throw err;
  }
};
export const getSingleApfcDeviceAPI = async (apfc_id: any) => {
  try {
    const response = await $fetch2.get(`/devices/${apfc_id}`);

    return response;
  } catch (err) {
    throw err;
  }
};
export const syncDeviceParamsAPI = async (serial: any, apfc_id: any) => {
  try {
    const response = await $fetch2.post(
      `/devices/${apfc_id}/parameters/${serial}/sync`
    );

    return response;
  } catch (err) {
    throw err;
  }
};
export const updateSyncDeviceParamsAPI = async (id: any) => {
  try {
    const response = await $fetch2.get(`/devices/${id}/sync/params`);

    return response;
  } catch (err) {
    throw err;
  }
};
export const updateDevicePasswordAPI = async (
  apfc_id: string,
  payload: any
) => {
  try {
    const response = await $fetch2.patch(
      `/devices/${apfc_id}/reset-password`,
      payload
    );

    return response;
  } catch (err) {
    throw err;
  }
};
