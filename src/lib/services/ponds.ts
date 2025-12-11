import { $fetch } from "../fetch";
import { PondStatusChangePayload } from "../interfaces/maps/ponds";
export const AddPondInMapAPI = async (payload: any) => {
  try {
    return await $fetch.post(`/ponds`, payload);
  } catch (err) {
    throw err;
  }
};

export const getAllPondsAPI = async (queryParams: any) => {
  try {
    return await $fetch.get(`/ponds`, queryParams);
  } catch (err) {
    throw err;
  }
};

export const AddMotorToPondAPI = async (payload: any) => {
  try {
    return await $fetch.post(`/motors`, payload);
  } catch (err) {
    throw err;
  }
};

export const updatePondInMapAPI = async (payload: any) => {
  try {
    return await $fetch.patch(`/ponds/${payload.id}/details`, payload);
  } catch (err) {
    throw err;
  }
};

export const deleteMotorAPI = async (motorId: number, pondId: number) => {
  try {
    return await $fetch.delete(`/motors/${motorId}/ponds/${pondId}`);
  } catch (err) {
    throw err;
  }
};
export const deletePondAPI = async (pondId: number) => {
  try {
    return await $fetch.delete(`/ponds/${pondId}`);
  } catch (err) {
    throw err;
  }
};


export const singlePondAPI = async (pondId: number) => {
  try {
    const response = await $fetch.get(`/ponds/${pondId}/motors`);
    return response;
  } catch (err) {
    throw err;
  }
};

export const PondStatusChangeAPI = async (payload: PondStatusChangePayload) => {
  try {
    const response = await $fetch.patch(`/ponds/status/bulk`, payload);
    return response;
  } catch (err) {
    throw err;
  }
};