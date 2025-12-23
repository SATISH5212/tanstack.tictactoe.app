import clsx from "clsx";
import { Loader2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import { UserDropdownProps } from "src/lib/interfaces/users";
import DownArrowIcon from "../svg/DownArrow";
import { UsersSvg } from "../svg/UsersSvg";



const UserDropdown: React.FC<UserDropdownProps> = ({
  users,
  selectedUser,
  isUsersLoading,
  searchString,
  setSearchString,
  setIsSelectOpen,
  handleUserChange,
  handleClearUser,

  width = "w-full",
  height = "h-9",
  borderClass = "border-0 border-b-2",
  triggerClass = "",
  contentClass = "",
  inputClass = "",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [searchString]);

  return (
    <Select
      value={selectedUser?.id ? selectedUser.id.toString() : ""}
      onValueChange={handleUserChange}
      onOpenChange={(open) => {
        setIsSelectOpen(open);
        if (!open) setSearchString("");
      }}
    >
      <SelectTrigger
        className={clsx(width, height, borderClass, "rounded-lg text-sm py-1.5 gap-1 flex items-center justify-between", triggerClass)}
      >
        <div className="flex items-center gap-1 capitalize truncate">
          <UsersSvg className="w-5 h-5 shrink-0" />
          <SelectValue placeholder="Select User">
            {selectedUser ? selectedUser.full_name : "Select User"}
          </SelectValue>
        </div>

        {selectedUser ? (
          <X
            className="w-3 h-3 cursor-pointer shrink-0"
            onPointerDown={(e) => {
              e.preventDefault();
              handleClearUser();
            }}
          />
        ) : (
          <DownArrowIcon className="w-4 h-4 shrink-0" />
        )}
      </SelectTrigger>

      <SelectContent
        className={clsx("bg-white p-1", contentClass)}
      >
        <div className="bg-white">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search users..."
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            className={clsx("w-full border text-xs rounded-lg px-3 py-2 focus:outline-none", inputClass)}
            autoFocus
          />
        </div>

        {isUsersLoading && users.length === 0 ? (
          <div className="flex items-center justify-center px-4 py-2">
            <Loader2 className="animate-spin size-4 mr-2" />
            <span className="text-gray-400 text-xs">Loading users...</span>
          </div>
        ) : users.length > 0 ? (
          <div className="max-h-60 overflow-y-auto p-1">
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                <div className="flex justify-between items-center w-full capitalize">
                  <span
                    className={
                      selectedUser?.id === user.id
                        ? "font-medium text-[#9333EA]"
                        : ""
                    }
                  >
                    {user.full_name}
                  </span>
                </div>
              </SelectItem>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 px-4 py-2 text-xs">
            No users available
          </div>
        )}
      </SelectContent>
    </Select>
  );
};

export default UserDropdown;
