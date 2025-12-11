import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserDetails } from "@/lib/helpers/userpermission";
import { UserAddDeviceAPI, UserEditDeviceAPI } from "@/lib/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
export interface DevicePayload {
  starter_number: string;
  alias_starter_title?: string;
}

export interface UserAddDeviceProps {
  device?: {
    id?: string | number;
    starter_number: string;
    alias_starter_title: string;
  };
  isEditMode?: boolean;
}

const UserAddDevice = ({ device, isEditMode = false }: UserAddDeviceProps) => {
  const queryClient = useQueryClient();
  const { pathname } = useLocation();
  const isDeviceAdd = pathname.includes("/gateways");
  const [isOpen, setIsOpen] = useState(false);
  const [deviceData, setDeviceData] = useState<DevicePayload>({
    starter_number: device?.starter_number || "",
    alias_starter_title: device?.alias_starter_title || "",
  });
  const [errors, setErrors] = useState<
    Partial<DevicePayload & { api: string }>
  >({});
  const { isOwner } = useUserDetails();

  const mutation = useMutation({
    mutationFn: isEditMode
      ? (payload: DevicePayload) => UserEditDeviceAPI(device?.id || "", payload)
      : UserAddDeviceAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["user-devices"] });
      setIsOpen(false);
      setDeviceData({ starter_number: "", alias_starter_title: "" });
      setErrors({});
      toast.success(
        isEditMode ? "Device updated successfully" : "Device added successfully"
      );
    },
    onError: (error: any) => {
      if (error?.status === 422) {
        const errorMessages = error?.data?.errors || error?.data?.message;
        setErrors(errorMessages);
      } else if (
        error?.status === 409 ||
        error?.status === 401 ||
        error?.status === 400 ||
        error?.status === 404
      ) {
        toast.error(
          error?.data?.message || "An error occurred. Please try again."
        );
      }
    },
  });

  const handleDrawerClose = () => {
    setIsOpen(false);
    setDeviceData({ starter_number: "", alias_starter_title: "" });
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeviceData((prev) => ({
      ...prev,
      [name]: name === "starter_number" ? value.toUpperCase() : value,
    }));
    setErrors((prev: any) => ({ ...prev, [name]: null, api: null }));
  };

  const handleSubmit = () => {
    mutation.mutate({
      starter_number: deviceData.starter_number,
      ...(deviceData.alias_starter_title?.trim() && {
        alias_starter_title: deviceData.alias_starter_title.trim(),
      }),
    });
  };

  return (
    <div>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) handleDrawerClose();
        }}
      >
        <DialogTrigger asChild>
          {isOwner() && !isDeviceAdd && (
            <Button
              onClick={() => setIsOpen(true)}
              className="h-7 px-2 bg-green-500 hover:bg-green-600 rounded flex items-center gap-1 text-white text-sm 3xl:text-sm font-normal disabled:cursor-not-allowed disabled:opacity-50"
              disabled={mutation.isPending}
            >
              <span>{isEditMode ? "Edit Device" : "+ Add Device"}</span>
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="bg-white max-w-md w-full rounded-md font-inter overflow-y-auto [&>button]:hidden">
          <DialogHeader>
            <div className="flex items-center justify-between -mt-2 ">
              <DialogTitle className="font-inter text-black/80 font-medium  text-md 3xl:text-lg">
                {isEditMode ? "Edit Device" : "Add Device"}
              </DialogTitle>
              <Button
                variant="outline"
                onClick={handleDrawerClose}
                className="text-center text-md p-0 h-6 w-6 rounded-full  hover:bg-red-200 text-red-400 hover:text-red-500 "
              >
                <X />
              </Button>
            </div>
          </DialogHeader>

          <div className="grid gap-4  pb-5 -mt-3">
            <div className="flex flex-col space-y-1">
              <Label className="text-sm 3xl:text-base font-normal">
                Starter Id <span className="text-red-500">*</span>
              </Label>
              <Input
                id="starter_number"
                placeholder="Enter Starter Id"
                name="starter_number"
                value={deviceData.starter_number.toUpperCase()}
                onChange={handleChange}
                className="font-inter shadow-none border border-gray-200 bg-gray-100 focus-visible:ring-0 placeholder:font-inter placeholder:text-xs font-light"
              />
              {errors?.starter_number && (
                <span className="text-red-500 text-xs font-inter font-light mt-1">
                  {errors.starter_number}
                </span>
              )}
            </div>

            <div className="flex flex-col space-y-1">
              <Label className="text-sm 3xl:text-base font-normal">Title</Label>
              <Input
                className="bg-gray-100 border-gray-200 shadow-none font-inter rounded-md focus-visible:ring-0 text-xs 3xl:text-md placeholder:font-inter placeholder:text-xs font-light"
                placeholder="Enter Title"
                id="title"
                name="alias_starter_title"
                value={deviceData.alias_starter_title}
                onChange={handleChange}
                maxLength={30}
              />
              {errors?.alias_starter_title && (
                <span className="text-red-500 text-xs font-inter font-light mt-1">
                  {errors.alias_starter_title}
                </span>
              )}
            </div>

            {errors?.api && (
              <span className="text-red-500 text-xs font-inter font-light mt-1">
                {errors.api}
              </span>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDrawerClose}
              className="text-center text-sm h-7 px-3 font-light border border-gray-200 hover:bg-gray-200 rounded"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="text-center flex justify-center text-sm text-white px-6 h-7  bg-green-500 hover:bg-green-600 font-light rounded"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : isEditMode ? (
                "Update"
              ) : (
                "Add"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserAddDevice;
