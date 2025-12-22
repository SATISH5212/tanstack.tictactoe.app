import { $fetch } from "../fetch";
export const getAllUsersAPI = async (queryParams: any) => {
  try {
    const response = await $fetch.get("/users", queryParams);
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


