import { $fetch } from "../fetch";

interface DevicePayload {
  starter_number: string;
  alias_starter_title?: string;
}

export const UserAddDeviceAPI = async (payload: DevicePayload) => {
  try {
    const response = await $fetch.patch("/starter/add-user", payload);
    return response;
  } catch (err) {
    throw err;
  }
};

export const UserEditDeviceAPI = async (
  id: string | number,
  payload: DevicePayload
) => {
  try {
    const response = await $fetch.post(`/starter/edit-user/${id}`, payload);
    return response;
  } catch (err) {
    throw err;
  }
};

export const addUserLocationAPI = async (payload: any) => {
  try {
    const response = await $fetch.post("/locations", payload);
    return response;
  } catch (err) {
    throw err;
  }
};
export const updateUserLocationAPI = async (id: any, payload: any) => {
  try {
    const response = await $fetch.patch(`/locations/${id}`, payload);
    return response;
  } catch (err) {
    throw err;
  }
};


export const getAllUserLocations = async (queryParams: any) => {
  try {
    const response = await $fetch.get(`/locations/web-user`, queryParams);
    return response;
  } catch (err) {
    throw err;
  }
};

export const removeAssignedUserLocationAPI = async (payload: any) => {
  try {
    const response = await $fetch.patch(`/locations/remove-assigned-user?confirm=true`, payload);
    return response;
  } catch (err) {
    throw err;
  }
}

export const removeAssignedUserPondsAPI = async (pond_id: number, payload: { user_id: number }) => {
  try {
    const response = await $fetch.patch(`/ponds/${pond_id}/remove-assigned-user`, payload);
    return response;
  } catch (err) {
    throw err;
  }
}
export const deleteLocationAPI = async (id: any) => {
  try {
    const response = await $fetch.delete(`/locations/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
}
export const editLocationAPI = async (id: any, payload: any) => {
  try {
    const response = await $fetch.put(`/locations/${id}`, payload);
    return response;
  } catch (err) {
    throw err;
  }
}


export const getViewProfileDetails = async (queryParams: any) => {
  try {
    const response = await $fetch.get(`/users/profile`, queryParams);
    return response;
  } catch (err) {
    throw err;
  }
}

export const UserBasedPondsApi = async (queryParams: any) => {
  try {
    const response = await $fetch.get(`/users/based-ponds`, queryParams);
    return response;
  } catch (err) {
    throw err;
  }
}
export const userbasedLocationsAPI = async (queryParams: any) => {
  try {
    const response = await $fetch.get(`/locations/assign-user`, queryParams);
    return response;
  } catch (err) {
    throw err;
  }
}
export const assignLocationToUserAPI = async (queryParams: any) => {
  try {
    const response = await $fetch.patch(`/locations/assign-user `, queryParams);
    return response;
  } catch (err) {
    throw err;
  }
}


export const getAllLocationsForUserAPI = async (queryParams: any) => {
  try {
    const response = await $fetch.get(`/users/based-locations`, queryParams);
    return response;
  } catch (err) {
    throw err;
  }
}

