import { UserProfileDropdownProps } from "@/lib/interfaces/users";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { LogoutIcon } from "../svg/LogoutIcon";
import PondEditIcon from "../svg/PondEditIcon";
import { Avatar, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const UserProfileDropdown = ({
  menuRef,
  isSuperAdmin,
  fullName,
  shortName,
  initial,
  onNavigate,
}: UserProfileDropdownProps) => {

  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative z-50" ref={menuRef}>
      <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
        <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1   border-b-2  bg-blue-100  rounded-lg  dark:hover:bg-gray-800 transition cursor-pointer select-none">
          {isSuperAdmin ? (
            <Avatar className="w-6 h-6">
              <AvatarImage
                src="/assets/admin.svg"
                alt="Admin Avatar"
                className="rounded-full"
              />
            </Avatar>
          ) : (
            <div
              className="
                flex items-center justify-center
                w-7 h-7 rounded-full 
                bg-green-500 text-white 
                font-semibold text-sm uppercase 
                shadow-sm
              "
              title={fullName}
            >
              {initial}
            </div>
          )}

          <span
            className="
              text-sm font-medium capitalize
              text-blue-800 dark:text-gray-200 
              max-w-[140px] truncate
              cursor-pointer
            "
            title={fullName}
          >
            {shortName}
          </span>

          {isOpen ? (
            <ChevronUp className="w-4 h-4 opacity-80 transition-transform" />
          ) : (
            <ChevronDown className="w-4 h-4 opacity-80 transition-transform" />
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          sideOffset={2}
          className="bg-white w-42 rounded-lg shadow-xl border border-gray-100"
        >



          <DropdownMenuItem
            className="cursor-pointer flex items-center gap-3 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-md mx-1"
            onClick={() => onNavigate("/logout")}
          >
            <LogoutIcon className="w-4  text-red-600" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserProfileDropdown;
