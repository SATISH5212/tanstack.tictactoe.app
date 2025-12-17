import { useUserDetails } from "@/lib/helpers/userpermission";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  useLocation,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";

import { editPasswordAPI } from "@/lib/services/auth";
import { toast } from "sonner";

import UserProfileDropdown from "./navbar/UserProfileDropdown";
import { MenuIcon } from "./svg/MenuIcon";

const AppSideBar = () => {
  const router = useRouter();
  const { pathname } = useLocation();
  const { isAdmin, isSuperAdmin, isSupervisor, isOwner, isUser, getName } =
    useUserDetails();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isUpdatePassword, setIsUpdatePassword] = useState(false);
  const [updatePassword, setUpdatePassword] = useState("");
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);


  // const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

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
    <div className="flex min-h-screen ">
      <div className="w-full flex flex-col  ">
        <div className="px-2 sticky top-0 py-2 z-50">
          <div className="flex items-center justify-between">
            <img src="/idhara_logo.svg" alt="Logo" className=" w-32 h-10 p-2" />

            <div className="flex items-center justify-end w-1/4 gap-2  ">
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
      </div>
    </div>
  );
};

export { AppSideBar };
