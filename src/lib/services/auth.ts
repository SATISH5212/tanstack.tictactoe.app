import { $fetch } from "../fetch";
export const loginAPI = async (payload: {
    email: string;
    password: string;
  }) => {
    try {
      const response = await $fetch.post("/auth/signin-email", payload);
      return response;
    } catch (err) {
      throw err;
    }
  };
  export const sendOtpAPI = async (payload: {
 phone: string;
  }) => {
    try {
      const response = await $fetch.post("/users/sign-in/send-otp", payload);
      return response;
    } catch (err) {
      throw err;
    }
  };
  export const verifyOtpAPI = async (payload: {
    phone: string;
    otp: string;
  }) => {
    try {
      const response = await $fetch.post("/users/sign-in/verify-otp", payload);
      return response;
    } catch (err) {
      throw err;
    }
  };
  

  export const editPasswordAPI = async (password: string) => {
  try {
    const response = await $fetch.patch(`/users/update-password`,{
      password
    });
    return response;
  } catch (err) {
    throw err;
  }
}