import { useUserDetails } from "@/lib/helpers/userpermission";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  useRouter,
} from "@tanstack/react-router";
import Cookies from "js-cookie";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocationContext } from "./context/LocationContext";
import { usePondContext } from "./context/PondsProvider";

import { editPasswordAPI } from "@/lib/services/auth";
import { toast } from "sonner";
import LocationDropdown from "./core/LocationDropdown";

import UserDropdown from "./core/UsersDropdown";
import AiChatComponent from "./dashboard/AiChatbot";
import UserProfileDropdown from "./navbar/UserProfileDropdown";
import { DashboardIcon } from "./svg/DashboardIcon";
import { DashboardSvg } from "./svg/DashobardSvg";
import { DevicesSvg } from "./svg/DevicesSvg";
import { LocationSvg } from "./svg/location";
import { MenuIcon } from "./svg/MenuIcon";
import { UsersSvg } from "./svg/UsersSvg";
import UpdatePasswordDialog from "./usersModule/profileDetails/UpdatePasswordDialog";

const AppSideBar = () => {
  const router = useRouter();
  const { pathname } = useLocation();
  const { isAdmin, isSuperAdmin, isSupervisor, isOwner, isUser, getName } =
    useUserDetails();

  const {
    locations,
    selectedLocation,
    locationSearchString,
    setLocationSearchString,
    isLocationsLoading,
    setIsLocationSelectOpen,
    handleLocationChange,
    handleClearLocation,
    users,
    selectedUser,
    userSearchString,
    setUserSearchString,
    isUsersLoading,
    setIsUserSelectOpen,
    handleUserChange,
    handleClearUser,
  } = useLocationContext();

  const { user_id } = useParams({ strict: false });
  const { setIsChatOpen } = usePondContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isUpdatePassword, setIsUpdatePassword] = useState(false);
  const [updatePassword, setUpdatePassword] = useState("");
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const isDevicesRoute =
    pathname === "/devices" ||
    pathname === "/apfc" ||
    pathname.startsWith("/devices/") ||
    pathname.startsWith("/apfc/");
  const usersRoute = pathname.includes(`users/${user_id}`);
  const ispondsRoute =
    (pathname.includes("/ponds") || pathname.includes("/dashboard")) &&
    !pathname.includes("/users");
  const dashboard = pathname.includes("dashboard");
  const isLocationRoute = pathname.includes("/locations");
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const { mutate: editPassword, isPending: isEditingPasswordPending } =
    useMutation({
      mutationFn: ({ password }: { password: string }) =>
        editPasswordAPI(password),
      onSuccess: () => {
        toast.success("Password updated successfully!");
        setIsUpdatePassword(false);
        setUpdatePassword("");
        setEditErrorMessage(null);
      },
      onError: (error: any) => {
        if (error?.status === 422) {
          const errorMessages =
            error?.data?.errors?.password || error?.data?.message;
          setEditErrorMessage(errorMessages);
        } else if (error?.status === 409) {
          setEditErrorMessage(error?.data?.message);
        } else {
          toast.error(error?.data?.message || "Failed to update Password");
          setIsUpdatePassword(false);
        }
      },
      retry: false,
    });

  const handleEditPassword = (password: string) => {
    editPassword({
      password: password.trim(),
    });
  };

  const handleNavigation = (path: string) => {
    if (path === "/viewprofile") {
      queryClient.removeQueries({ queryKey: ["profileData"] });
    }
    if (path === "/logout") {
      Cookies.remove("token");
      Cookies.remove("userDetails");
      localStorage.removeItem("authToken");
      queryClient.clear();
      router.navigate({ to: "/" });
    } else {
      router.navigate({ to: path });
    }
    // queryClient.clear();
    setIsProfileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    const handleClickOutsideSidebar = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutsideSidebar);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSidebar);
    };
  }, [isSidebarOpen]);

  const name = getName() || "";
  const fullName = name
    ? name
        .split(" ")
        .map(
          (word: string) =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ")
    : "";

  const initial = fullName ? fullName.charAt(0) : "";
  const shortName =
    fullName.length > 15 ? fullName.slice(0, 15) + "..." : fullName;

  return (
    <div className="flex min-h-screen">
      <div
        ref={sidebarRef}
        className={`bg-white fixed text-black text-xs transition-all duration-300 w-custom_15per h-dvh z-9999 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div
          className="absolute top-3 right-3 p-2 cursor-pointer"
          onClick={toggleSidebar}
        >
          <X className="h-4 w-4 cursor-pointer" />
        </div>
        <div className="flex flex-col justify-between h-full px-4 py-4 ">
          <div className="space-y-10">
            <div className="w-fit h-fit">
              <DashboardIcon />
            </div>
            <div className="flex flex-col items-center w-full gap-5">
              {isAdmin() && (
                <button
                  onClick={() => {
                    router.navigate({ to: "/dashboard", search: {} });
                    toggleSidebar();
                  }}
                  className={`w-full flex justify-center border-2 border-gray-200 rounded-xl ${
                    dashboard ? "bg-primary text-white" : ""
                  }`}
                >
                  <div
                    className={`flex items-center w-full gap-3 p-2 rounded-lg transition-colors`}
                  >
                    <DashboardSvg
                      className={`${ispondsRoute ? "text-white" : "text-black"}`}
                    />
                    <div>Dashboard</div>
                  </div>
                </button>
              )}
              {isUser() && (
                <button
                  onClick={() => {
                    if (pathname.includes("/dashboard")) {
                      toggleSidebar();
                    } else if (pathname.includes("/ponds")) {
                      toggleSidebar();
                    } else {
                      toggleSidebar();
                      navigate({
                        to: "/ponds",
                        search: {},
                      });
                    }
                  }}
                  className={`w-full flex justify-center border-2 border-gray-200 rounded-xl ${
                    ispondsRoute ? "bg-primary text-white" : ""
                  }`}
                >
                  <div
                    className={`flex items-center w-full gap-3 p-2 rounded-lg transition-colors`}
                  >
                    <DashboardSvg
                      className={`${ispondsRoute ? "text-white" : "text-black"}`}
                    />
                    <div>Ponds</div>
                  </div>
                </button>
              )}

              {isSuperAdmin() && (
                <button
                  onClick={() => {
                    navigate({ to: `/users`, search: undefined });
                    toggleSidebar();
                  }}
                  className="w-full flex justify-center border-2 border-gray-200 rounded-xl"
                >
                  <div
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors w-full ${
                      usersRoute ? "bg-primary text-white" : ""
                    }`}
                  >
                    <UsersSvg
                      className={`${usersRoute ? "text-white" : "text-black"}`}
                    />
                    <div>Users</div>
                  </div>
                </button>
              )}

              <button className="w-full flex justify-center border-2 border-gray-200 rounded-xl">
                <div
                  onClick={() => {
                    navigate({ to: `/devices`, search: {} });
                    toggleSidebar();
                  }}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors w-full ${
                    isDevicesRoute
                      ? "bg-primary text-white"
                      : "text-black hover:bg-gray-100"
                  }`}
                >
                  <DevicesSvg
                    className={`${isDevicesRoute ? "text-white" : "text-black"}`}
                  />
                  <div>Devices</div>
                </div>
              </button>
              {(isUser() || isSupervisor()) && (
                <button className="w-full flex justify-center border-2 border-gray-200 rounded-xl">
                  <div
                    onClick={() => {
                      navigate({ to: `/locations`, search: undefined });
                      toggleSidebar();
                    }}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors w-full ${
                      isLocationRoute
                        ? "bg-primary text-white"
                        : "text-black hover:bg-gray-100"
                    }`}
                  >
                    <div
                      className={`${isLocationRoute ? "text-white" : "text-black"}`}
                    >
                      <LocationSvg />
                    </div>
                    <div>Locations & Gateways</div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col  ">
        <div className="px-5  bg-white border border-b-2 border-gray-200 sticky top-0 py-2 z-50">
          <div className="flex items-center justify-between">
            <div className="cursor-pointer" onClick={toggleSidebar}>
              <div className="flex items-center gap-2">
                <MenuIcon />
                <div>Menu</div>
              </div>
            </div>

            <div className="flex items-center justify-end w-1/4 gap-2  ">
              <div className="flex items-center gap-4 ">
                {dashboard && (
                  <>
                    {isAdmin() && (
                      <div className="w-[250px]">
                        <UserDropdown
                          users={users}
                          selectedUser={selectedUser}
                          isUsersLoading={isUsersLoading}
                          searchString={userSearchString}
                          setSearchString={setUserSearchString}
                          setIsSelectOpen={setIsUserSelectOpen}
                          handleUserChange={handleUserChange}
                          handleClearUser={handleClearUser}
                          ispondsRoute={ispondsRoute}
                        />
                      </div>
                    )}
                    <div className="w-[250px]">
                      <LocationDropdown
                        pond={{ location: selectedLocation?.id }}
                        locations={locations}
                        isLocationsLoading={isLocationsLoading}
                        searchString={locationSearchString}
                        setSearchString={setLocationSearchString}
                        setIsSelectOpen={setIsLocationSelectOpen}
                        handlePondLocationChange={handleLocationChange}
                        selectedLocation={selectedLocation}
                        handleClearLocation={handleClearLocation}
                        ispondsRoute={ispondsRoute}
                      />
                    </div>
                  </>
                )}
              </div>
              <UserProfileDropdown
                menuRef={menuRef}
                isSuperAdmin={isSuperAdmin()}
                isOwner={isOwner()}
                fullName={fullName}
                shortName={shortName}
                initial={initial}
                onNavigate={handleNavigation}
                onUpdatePassword={() => setIsUpdatePassword(true)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-y-hidden">
          <Outlet />
        </div>
        <div
          className="fixed bottom-12 right-10 z-[9999] cursor-pointer transition-all duration-300 hover:-translate-y-2"
          onClick={() => setIsChatOpen(true)}
        >
          <img
            src="/FarmerChatBotIcon.svg"
            alt="Logo"
            className="w-15 h-15 select-none"
          />
        </div>

        <AiChatComponent onCloseChat={() => setIsChatOpen(false)} />
        <UpdatePasswordDialog
          isOpen={isUpdatePassword}
          onClose={() => setIsUpdatePassword(false)}
          onSave={handleEditPassword}
          isPending={isEditingPasswordPending}
          errorMessage={editErrorMessage}
          setErrorMessage={setEditErrorMessage}
          updatePassword={updatePassword}
          setUpdatePassword={setUpdatePassword}
        />
      </div>
    </div>
  );
};

export { AppSideBar };
