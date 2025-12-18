import { $fetch } from "../fetch";
export const getAllUsersAPI = async (queryParams: any) => {
  try {
    const response = await $fetch.get("/users", queryParams);
    return response;
  } catch (err) {
    throw err;
  }
};

export const getUserBasedPondsAPI = async (queryParams: any, usersId: any) => {
  try {
    const response = await $fetch.get(`/users/${usersId}/ponds`, queryParams);
    return response;
  } catch (err) {
    throw err;
  }
};

export const getUserLogsPondsAPI = async (queryParams: any, pond_id: any) => {
  try {
    const response = await $fetch.get(`/ponds/${pond_id}/logs`, queryParams);
    return response;
  } catch (err) {
    throw err;
  }
};


export const getUserLogsDeviceAPI = async (queryParams: any, pond_id: any) => {
  try {
    const response = await $fetch.get(`/ponds/${pond_id}/starter-logs`, queryParams);
    return response;
  } catch (err) {
    throw err;
  }
};
export const getUserBasedPondsAlertLogsAPI = async (pond_id: any, queryParams: any) => {
  try {
    const response = await $fetch.get(`/motors/${pond_id}/ponds-logs`, queryParams);
    return response;
  } catch (err) {
    throw err;
  }
};
export const getUserBasedFaultLogsAPI = async (motor_id: any, queryParams: any) => {
  try {
    const response = await $fetch.get(`/motors/${motor_id}/alerts-faults-logs`, queryParams);
    return response;
  } catch (err) {
    throw err;
  }
}

export const getSingleUserDevicesAPI = async (
  queryParams: any,
  user_id: string
) => {
  try {
    const response = await $fetch.get(
      `/users/${user_id}/starters`,
      queryParams
    );
    return response;
  } catch (err) {
    throw err;
  }
};
export const exportUsersDevicesAPI = async (user_id: any, queryParams: any) => {
  try {
    const response = await $fetch.get(`/users/${user_id}/starter-export`, queryParams);
    return response;
  } catch (err) {
    throw err;
  }
}

export const deleteUsersDeviceAPI = async (id: string) => {
  try {
    return await $fetch.delete(`/starter/${id}`);
  } catch (err) {
    throw err;
  }
};

export const getSingleUserMotersAPI = async (device_id: string) => {
  try {
    const response = await $fetch.get(`/starter/${device_id}/motors`);
    return response;
  } catch (err) {
    throw err;
  }
};

// create user api
export const createUserAPI = async (payload: any) => {
  try {
    const response = await $fetch.post("/auth/register", payload);
    return response;
  } catch (err) {
    throw err;
  }
};
//delete user api
export const deleteUserAPI = async (userId: any) => {
  try {
    const response = await $fetch.delete(`/users/${userId}`);
    return response;
  } catch (err) {
    throw err;
  }
};
//update user
export const updateUserAPI = async (payload: any, userId: any) => {
  try {
    const response = await $fetch.patch(`/users/${userId}`, payload);
    return response;
  } catch (err) {
    throw err;
  }
};
//get single users details
export const getSingleUserAPI = async (userId: any) => {
  try {
    const response = await $fetch.get(`/users/${userId}`);
    return response;
  } catch (err) {
    throw err;
  }
};
export const getDeviceInfo = async (id: any) => {
  try {
    const response = await $fetch.get(`/starter/${id}/info`);
    return response;
  } catch (err) {
    throw err;
  }
};

export const getAllUserDevicesAPI = async () => {
  try {
    const response = await $fetch.get(`/starter/drop-down`);
    return response;
  } catch (err) {
    throw err;
  }
};

export const addDeviceToUserAPI = async (motorId: number, payload: any) => {
  try {
    return await $fetch.patch(`/motors/${motorId}/config`, payload);
  } catch (err) {
    throw err;
  }
}


export const getPondAlertLogsAPI = async (queryParams: any, pond_id: any) => {
  try {
    const response = await $fetch.get(`/ponds/${pond_id}/starter-alerts`, queryParams);
    return response;
  } catch (err) {
    throw err;
  }
};
export const getPondFaultLogsAPI = async (queryParams: any, pond_id: any) => {
  try {
    const response = await $fetch.get(`/ponds/${pond_id}/starter-faults`, queryParams);
    return response;
  } catch (err) {
    throw err;
  }
};