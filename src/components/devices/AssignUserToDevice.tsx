import React, { useState, useMemo, useRef } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "src/components/ui/dialog";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { RadioGroup, RadioGroupItem } from "src/components/ui/radio-group";
import { Label } from "src/components/ui/label";
import { fetchUsersAPI } from "src/lib/services/apfc";
import { capitalize } from "src/lib/helpers/capitalize";
import { useNavigate } from "@tanstack/react-router";
import AddIcon from "../icons/apfc/AddIcon";
import {
  AssignUserProps,
  UserProps,
} from "@/lib/interfaces/devices/userDevices";
import {
  assignUserForDeviceAPI,
  getAllUsersForDeviceAPI,
} from "@/lib/services/deviceses";

const AssignUserToDevice: React.FC<AssignUserProps> = ({
  open,
  onClose,
  getData,
  device_id,
  deviceData,
}: any) => {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);
  const navigate = useNavigate();
  const userListRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["userDevices", search],
      queryFn: async ({ pageParam = 1 }) => {
        const response = await getAllUsersForDeviceAPI({
          page: pageParam,
          page_size: 10,
          search_string: search,
        });
        return response?.data?.data || { records: [], pagination: {} };
      },
      getNextPageParam: (lastPage) => {
        return lastPage.pagination.next_page || undefined;
      },
      initialPageParam: 1,
      enabled: open,
    });

  const usersData = useMemo(() => {
    return data?.pages.flatMap((page) => page.records) || [];
  }, [data]);

  const filteredUsers = usersData;

  const handleScroll = (e: React.SyntheticEvent) => {
    const container = e.currentTarget as HTMLDivElement;
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      container.scrollTop + container.clientHeight >=
        container.scrollHeight - 10
    ) {
      fetchNextPage();
    }
  };

  const assignUserToDeviceMutation = useMutation({
    mutationFn: (userId: number) => {
      const payload = { user_id: userId, starter_id: device_id };
      return assignUserForDeviceAPI(payload);
    },
    onSuccess: (response: any) => {
      if (response?.success) {
        onClose();
        toast.success(response?.data?.message || "User assigned successfully");
        getData();
        setSelectedUser(null);
        setSearch("");
        queryClient.invalidateQueries({ queryKey: ["devices"] }); 
      }
    },
    onError: (err: any) => {
      toast.error(err?.data?.message || "Failed to assign user");
    },
  });

  const handleClose = () => {
    onClose();
    setSearch("");
    setSelectedUser(null);
    queryClient.removeQueries({ queryKey: ["userDevices"] });
  };

 const handleConfirm = () => {
   if (selectedUser?.id && device_id) {
    
     assignUserToDeviceMutation.mutate(selectedUser.id);
   } 
 };

  return (
    <Dialog open={open}
       onOpenChange={(isOpen) => {
        if (isOpen) {
          return;
        }
        return;
      }}
     >
      <DialogContent className="max-w-xs rounded-lg bg-white p-4 [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between border-0 p-0">
          <DialogTitle className="text-sm 3xl:text-lg font-normal text-black sm:text-lg">
            Select User
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full p-0 hover:bg-red-200 text-red-500 hover:text-red-600"
            onClick={handleClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </DialogHeader>
        <div className="mt-2">
          <Input
            type="search"
            placeholder="Search"
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            className="h-8 rounded border border-gray-300 bg-white text-sm text-gray-500 focus:border-primary focus:ring-0"
          />
          <div
            ref={userListRef}
            onScroll={handleScroll}
            className="h-60 overflow-y-auto mt-2"
          >
            <RadioGroup
              value={selectedUser?.id?.toString() || ""}
              onValueChange={(value: string) => {
                const user = filteredUsers?.find(
                  (u: UserProps) => u?.id.toString() === value
                );
                setSelectedUser(user || null);
              }}
            >
              {isLoading && filteredUsers.length === 0 ? (
                <div className="w-full h-60 flex items-center justify-center">
                  <span className="text-gray-400">Loading users...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="w-full h-60 flex items-center justify-center">
                  <span className="text-gray-400">No users found.</span>
                </div>
              ) : (
                <>
                  {filteredUsers?.map((user: UserProps) => (
                    <div
                      key={user?.id}
                      className="flex items-center space-x-2 rounded p-0.5 hover:bg-gray-100"
                    >
                      <RadioGroupItem
                        value={user?.id.toString()}
                        id={user?.id.toString()}
                        className="text-gray-300 data-[state=checked]:text-primary"
                      />
                      <Label
                        htmlFor={user?.id.toString()}
                        className="flex-1 p-1 cursor-pointer truncate text-smd 3xl:text-base font-normal text-black"
                      >
                        {user?.full_name?.length > 20 ? (
                          <span title={user?.full_name}>
                            {capitalize(user?.full_name.slice(0, 20) + "...")}
                          </span>
                        ) : (
                          capitalize(user?.full_name)
                        )}
                      </Label>
                    </div>
                  ))}
                  {isFetchingNextPage && (
                    <div className="flex justify-center py-2">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                    </div>
                  )}
                </>
              )}
            </RadioGroup>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Button
            variant="outline"
            className="bg-red-50 text-xs 3xl:text-sm font-medium text-black hover:bg-red-100 h-auto py-1.5"
            onClick={() => navigate({ to: "/users/add" })}
          >
            <AddIcon className="size-3" />
            Add New User
          </Button>
          <Button
            disabled={!selectedUser?.id}
            onClick={handleConfirm}
            className="bg-primary text-xs 3xl:text-sm font-medium text-white hover:bg-primary/90 h-auto py-1.5"
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignUserToDevice;

