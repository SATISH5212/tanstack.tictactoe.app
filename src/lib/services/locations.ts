import { $fetch } from "../fetch";

export const addLocationAPI = async (payload: any) => {
  try {
    const response = await $fetch.post("/locations", payload);
    return response;
  } catch (err) {
    throw err;
  }
};

export const getAdminUserLocationsAPI = async (queryParams : any) => {
  try {
    const response = await $fetch.get(`/locations/basic`, queryParams);
    return response;
  } catch (err) {
    throw err;
  }
};