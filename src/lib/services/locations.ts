import { $fetch } from "../fetch";

export const addLocationAPI = async (payload: any) => {
  try {
    const response = await $fetch.post("/locations", payload);
    return response;
  } catch (err) {
    throw err;
  }
};

//add gateway to location
export const addGatewayAPI = async (payload: any) => {
  try {
    const response = await $fetch.post("/gateways", payload);
    return response;
  } catch (err) {
    throw err;
  }
};
//update gateway
export const updateGatewayAPI = async (payload: any, gatewayId: any) => {
  try {
    const response = await $fetch.patch(`/gateways/${gatewayId}`, payload);
    return response;
  } catch (err) {
    throw err;
  }
};
//delete gateway
export const deleteGatewayAPI = async (gatewayId: any) => {
  try {
    const response = await $fetch.delete(`/gateways/${gatewayId}`);
    return response;
  } catch (err) {
    throw err;
  }
};
export const getallUserBasedLocation = async (user_id: any, queryParams: any) => {
  try {
    const response = await $fetch.get(`/users/${user_id}/locations-gateway`, queryParams);
    return response;
  } catch (err) {
    throw err;
  }
};

export const fetchLocationsAPI = async (queryParams: any) => {
  try {
    const response = await $fetch.get(`/locations/drop-down`, queryParams);

    return response;
  } catch (err) {
    throw err;
  }
};


export const getAdminUserLocationsAPI = async (user_id: number) => {
  try {
    const response = await $fetch.get(`/users/${user_id}/locations`);
    return response;
  } catch (err) {
    throw err;
  }
};