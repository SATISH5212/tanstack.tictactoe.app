import { useStore } from "@tanstack/react-store";
import { authStore } from "../interfaces/auth/auth";

export const useUserDetails = () => {
  const userDetails = useStore(authStore, (state: any) => state["user"]);

  const userType = userDetails?.user_type;
  const userId = userDetails?.id;

  const isAdmin = () => userType === "ADMIN";
  const isUser = () =>
    userType === "OWNER" || userType === "MANAGER" || userType === "USER" || userType === "SUPERVISOR";
  const isOwner = () => userType === "OWNER";
  const isSuperAdmin = () => userType === "SUPER_ADMIN" || userType === "ADMIN";
  const isSupervisor = () => userType === "SUPERVISOR"
  const isManager = () => userType === "MANAGER";
  const configDevice = () => userType === "SUPERVISOR";
  const getUserId = () => userId;
  const getName = () => userDetails?.full_name;
  const isUserId = () => userId;
  const getUserPermissions = () => {
    switch (userType) {
      case "OWNER":
      case "SUPER_ADMIN":
      case "ADMIN":
        return true;
      default:
        return [];
    }
  };

  return {
    isAdmin,
    isUser,
    isSuperAdmin,
    userDetails,
    getUserPermissions,
    getUserId,
    userId,
    isSupervisor,
    isOwner,
    getName,
    isUserId,
    configDevice,
    isManager

  };
};
