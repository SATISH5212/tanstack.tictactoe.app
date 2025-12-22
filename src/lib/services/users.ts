import { $fetch } from "../fetch";

// create user api
export const createUserAPI = async (payload: any) => {
  try {
    const response = await $fetch.post("/auth/register", payload);
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

export const deleteUsersDeviceAPI = async (id: string) => {
  try {
    return await $fetch.delete(`/starter/${id}`);
  } catch (err) {
    throw err;
  }
};


