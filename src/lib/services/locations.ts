import { $fetch } from "../fetch";

export const getAdminUserLocationsAPI = async (queryParams : any) => {
  try {
    const response = await $fetch.get(`/locations/basic`, queryParams);
    return response;
  } catch (err) {
    throw err;
  }
};