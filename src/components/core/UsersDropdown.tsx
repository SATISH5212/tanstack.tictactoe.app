import { Check, Loader2, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import { UserDropdownProps, UsersList } from "src/lib/interfaces/users";
import DownArrowIcon from "../svg/DownArrow";
import { UsersSvg } from "../svg/UsersSvg";
import { useEffect, useRef } from "react";

const UserDropdown: React.FC<any> = ({
  users,
  selectedUser,
  isUsersLoading,

  searchString,
  setSearchString,
  setIsSelectOpen,
  handleUserChange,
  handleClearUser,
  ispondsRoute,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [searchString]);

  return (
    <Select
      value={selectedUser?.id ? selectedUser.id.toString() : ""}
      onValueChange={handleUserChange}
      // onOpenChange={(open) => {
      //   setIsSelectOpen(open);
      //   if (!open) {
      //     setSearchString("");
      //   }
      // }}
    >
      <SelectTrigger className="!border-0 !border-b-2  w-full border rounded-lg text-sm py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 gap-1 h-full">
        <div className="flex items-center gap-1 capitalize">
          <UsersSvg className="w-5 h-5" />
          <SelectValue placeholder="Select User">
            {selectedUser ? selectedUser.full_name : "Select User"}
          </SelectValue>
        </div>

        {!ispondsRoute && selectedUser ? (
          <X
            className="w-3 h-3 cursor-pointer"
            onPointerDown={(e) => {
              e.preventDefault();
              handleClearUser();
            }}
          />
        ) : (
          <DownArrowIcon className="w-4 h-4" />
        )}
      </SelectTrigger>

      <SelectContent className="bg-white p-1">
        <div className="bg-white  z-60 ">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search users..."
            value={searchString}
            onChange={(e) => {
              setSearchString(e.target.value);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            onBlur={(e) => {
              e.preventDefault();
              setTimeout(() => {
                inputRef.current?.focus();
              }, 0);
            }}
            className="w-full border text-xs rounded-lg px-3 py-2 focus:outline-none"
            autoFocus
          />
        </div>
        {isUsersLoading && users?.length === 0 ? (
          <div className="flex items-center justify-center px-4 py-2">
            <Loader2 className="animate-spin size-4 mr-2" />
            <span className="text-gray-400 text-xs">Loading users...</span>
          </div>
        ) : users?.length > 0 ? (
          <div className="max-h-60 overflow-y-auto p-1">
            {users.map((user: UsersList, index: number) => (
              <SelectItem
                key={`${user.id}-${index}`}
                value={user.id.toString()}
              >
                <div className="flex justify-between items-center w-full cursor-pointer capitalize">
                  <span
                    className={`${selectedUser?.id?.toString() === user.id.toString() ? "font-medium text-[#9333EA]" : ""}`}
                  >
                    {user.full_name}
                  </span>
                  {selectedUser?.id?.toString() === user.id.toString() && (
                    <Check className="w-4 h-4 text-[#9333EA] ml-4" />
                  )}
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
