import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { addApfcAssignUserAPI, fetchUsersAPI } from "src/lib/services/apfc";
import { capitalize } from "src/lib/helpers/capitalize";
import { useNavigate } from "@tanstack/react-router";
import AddIcon from "../icons/apfc/AddIcon";

interface AssignUserDialogProps {
  open: boolean;
  onClose: () => void;
  getData: (params: any) => void;
  devicesId: string;
}

interface User {
  id: number;
  full_name: string;
  created_at: string;
  device_count: number;
  email: string;
  last_active_at: string | null;
  phone: string;
  status: string;
  updated_at: string;
  user_type: string;
}

const AssignUserDialog: React.FC<AssignUserDialogProps> = ({
  open,
  onClose,
  getData,
  devicesId,
}) => {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const { data: usersData = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetchUsersAPI();
      return response?.data?.data || [];
    },
  });

  // Client-side search filtering
  const filteredUsers = useMemo(() => {
    if (!search) return usersData;
    const searchLower = search.toLowerCase();
    return usersData.filter((user: User) =>
      user.full_name.toLowerCase().includes(searchLower)
    );
  }, [usersData, search]);

  const assignUserMutation = useMutation({
    mutationFn: (userId: number) => {
      const payload = { user: userId };
      return addApfcAssignUserAPI(payload, devicesId);
    },
    onSuccess: (response: any) => {
      if (response?.success) {
        onClose();
        toast.success(response?.data?.message);
        getData({});
        setSelectedUser(null);
        setSearch("");
      }
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to assign user");
    },
  });

  const handleClose = () => {
    onClose();
    setSearch("");
    setSelectedUser(null);
  };

  const handleConfirm = () => {
    if (selectedUser?.id) {
      assignUserMutation.mutate(selectedUser?.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
       
        className="max-w-xs rounded-lg bg-white p-4 [&>button]:hidden"
      >
        <DialogHeader className="flex flex-row items-center justify-between border-0 p-0">
          <DialogTitle className="text-sm 3xl:text-lg font-normal text-black sm:text-lg">
            Select User
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 rounded-full  hover:bg-red-200 text-red-400 hover:text-red-500"
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
          <div className="h-60 overflow-y-auto mt-2">
            <RadioGroup
              value={selectedUser?.id?.toString() || ""}
              onValueChange={(value: string) => {
                const user = filteredUsers?.find(
                  (u: User) => u?.id.toString() === value
                );
                setSelectedUser(user || null);
              }}
            >
              {filteredUsers?.map((user: User) => (
                <div
                  key={user?.id}
                  className="flex items-center space-x-2 rounded p-1 hover:bg-gray-100"
                >
                  <RadioGroupItem
                    value={user?.id.toString()}
                    id={user?.id.toString()}
                    className="text-gray-300 data-[state=checked]:text-primary"
                  />
                  <Label
                    htmlFor={user?.id.toString()}
                    className="flex-1 cursor-pointer truncate text-smd 3xl:text-base font-normal text-black"
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

export default AssignUserDialog;
