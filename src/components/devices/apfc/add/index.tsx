import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "src/components/ui/sheet";
import { addApfcDeviceAPI, fetchUsersAPI, UpdateApfcDeviceAPI } from "src/lib/services/apfc";
import { fetchLocationsAPI } from "src/lib/services/locations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import { AddApfcDeviceProps, DevicePayload, User } from "src/lib/interfaces/apfc";
import { syncDeviceParamsAPI } from "src/lib/services/apfc"; // Import sync API
import SyncDeviceDialog from "src/components/core/SyncDeviceParamatersDialog";

const AddApfcDevice = ({
  isOpen,
  onOpenChange,
  isEdit = false,
  deviceData,
  onResetEdit,
  refetchDevices,
}: AddApfcDeviceProps) => {
  const { user_id } = useParams({ strict: false }) as { user_id: string };
  const navigate = useNavigate();
  const isUserBasedFlow = !!user_id;

  const [deviceDetails, setDeviceDetails] = useState<any>({
    device_name: "",
    device_serial_number: "",
    locationId: "",
    userId: isUserBasedFlow ? user_id : "",
  });
  const [errorMessages, setErrorMessages] = useState<any>({});
  const [openSyncDialog, setOpenSyncDialog] = useState(false);
  const [newDeviceData, setNewDeviceData] = useState<any>(null);

  // User list dropdown API
  const { data: userDropdown = [], isLoading: isUserDropdownLoading } = useQuery({
    queryKey: ["UsersDropdown"],
    queryFn: () => fetchUsersAPI(),
    select: (response) => response?.data?.data || [],
  });

  // Locations API
  const { data: locations = [], isLoading: isLocationsLoading } = useQuery({
    queryKey: ["locations", deviceDetails.userId || user_id],
    queryFn: () =>
      fetchLocationsAPI({
        user_id: Number(deviceDetails.userId || user_id),
      }),
    select: (response) => response?.data?.data || [],
    enabled: !!deviceDetails.userId || isUserBasedFlow,
  });

  useEffect(() => {
    if (isEdit && deviceData) {
      setDeviceDetails({
        device_name: deviceData?.device_name || "",
        device_serial_number: deviceData?.device_serial_number || "",
        locationId: deviceData?.location_id?.toString() || "",
        userId: deviceData?.user_id?.toString() || (isUserBasedFlow ? user_id : ""),
      });
    } else {
      setDeviceDetails({
        device_name: "",
        device_serial_number: "",
        locationId: "",
        userId: isUserBasedFlow ? user_id : "",
      });
    }
  }, [isEdit, deviceData, isUserBasedFlow, user_id]);

  const preparePayload = (): DevicePayload => {
    return {
      device_name: deviceDetails.device_name?.trim() || "",
      device_serial_number: deviceDetails.device_serial_number?.trim() || "",
      location_id: deviceDetails.locationId ? Number(deviceDetails.locationId) : null,
      user_id: deviceDetails.userId ? Number(deviceDetails.userId) : null,
    };
  };

  const { mutate: addDeviceMutation, isPending: isStatusPending } = useMutation({
    mutationFn: (payload: DevicePayload) => addApfcDeviceAPI(payload),
    onSuccess: (response) => {
      setErrorMessages({});
      setNewDeviceData(response?.data?.data);
      setOpenSyncDialog(true);
    },
    onError: (error: any) => {
      if (error?.status === 409) {
        toast.error(error?.data?.message);
      } else if (error?.status === 422) {
        setErrorMessages(error?.data?.errors || {});
      } else {
        toast.error("Failed to create device");
      }
    },
    retry: false,

  });

  const { mutate: updateDeviceMutation, isPending: isUpdatePending } = useMutation({
    mutationFn: (payload: DevicePayload) => UpdateApfcDeviceAPI(deviceData?.id, payload),
    onSuccess: (response) => {
      setErrorMessages({});
      onOpenChange(false);
      toast.success(response?.data?.message);
      setDeviceDetails({
        device_name: "",
        device_serial_number: "",
        locationId: "",
        userId: isUserBasedFlow ? user_id : "",
      });
    },
    onError: (error: any) => {
      if (error?.status === 422) {
        setErrorMessages(error?.data?.errors || {});
      } else {
        toast.error(error.message || "Failed to update device");
      }
    },
    retry: false,

  });

  const { mutate: syncDeviceMutation, isPending: isSyncPending } = useMutation({
    mutationFn: ({ serial, apfc_id }: { serial: string; apfc_id: string }) =>
      syncDeviceParamsAPI(serial, apfc_id),
    onSuccess: (response) => {

      if (response?.status === 200) {
        toast.success("Device synced successfully");
        navigate({ to: `/apfc/${newDeviceData?.id}/update-settings?state=Level1` });
        setErrorMessages({});
        refetchDevices?.();
        onOpenChange(false);
      } else {
        toast.error(response?.data?.message || "Unexpected response from server");
        setErrorMessages({});
        setOpenSyncDialog(false);

      }
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to sync device");
      setErrorMessages({});
      setOpenSyncDialog(false);
    },
    retry: false,
  });

  const handleFieldValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeviceDetails((prev: any) => ({
      ...prev,
      [name]: value.replace(/\s+/g, " "),
    }));
  };

  const handleLocationChange = (value: string) => {
    setDeviceDetails((prev: any) => ({
      ...prev,
      locationId: value,
    }));
  };

  const handleUserChange = (value: string) => {
    setDeviceDetails((prev: any) => ({
      ...prev,
      userId: value,
      locationId: "",
    }));
  };

  const handleSubmit = () => {
    const payload = preparePayload();
    if (isEdit && deviceData?.id) {
      updateDeviceMutation(payload);
    } else {
      addDeviceMutation(payload);
    }
  };

  const handleSync = () => {
    const deviceId = isEdit ? deviceData?.id : newDeviceData?.id;
    const serial = isEdit ? deviceData?.device_serial_number : newDeviceData?.device_serial_number;
    syncDeviceMutation({ serial, apfc_id: deviceId });
    setDeviceDetails({
      device_name: "",
      device_serial_number: "",
      locationId: "",
      userId: isUserBasedFlow ? user_id : "",
    });
    setOpenSyncDialog(false);
    onOpenChange(false);
    refetchDevices?.();

  };

  const handleDrawerClose = () => {
    onOpenChange(false);
    setDeviceDetails({
      device_name: "",
      device_serial_number: "",
      locationId: "",
      userId: isUserBasedFlow ? user_id : "",
    });
    setErrorMessages({});
    setNewDeviceData(null);
    setOpenSyncDialog(false);
    if (onResetEdit) {
      onResetEdit(false);
    }
  };

  const handleClose = () => {
    refetchDevices?.();
    setOpenSyncDialog(false);
    onOpenChange(false);
    setDeviceDetails({
      device_name: "",
      device_serial_number: "",
      locationId: "",
      userId: isUserBasedFlow ? user_id : "",
    });
    setErrorMessages({});
    setNewDeviceData(null);
    if (onResetEdit) {
      onResetEdit(false);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <Button className="h-fit ml-auto px-3 py-2 bg-05A155 hover:bg-05A155 rounded flex items-center gap-1 text-white text-xs 3xl:text-sm cursor-pointer">
            <span>+ Add</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="bg-white w-custom_40per sm:max-w-custom_30per min-w-custom_30per max-w-custom_30per duration-200 translate-x-0 [&>button]:hidden px-6 py-0 font-inter">
          <SheetHeader>
            <div className="custom-header flex items-center justify-between pt-3">
              <SheetTitle className="font-inter text-black/80 font-normal text-md 3xl:text-lg p-0">
                {isEdit ? "Update APFC Device" : "Add APFC Device"}
              </SheetTitle>
              <Button
                variant="outline"
                onClick={handleDrawerClose}
                className="text-center text-md border border-gray-200 p-0 h-6 w-6 relative right-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
          </SheetHeader>
          <div className="grid gap-6 pt-6 pb-14">
            {/* Input fields remain the same */}
            <div className="flex flex-col space-y-1">
              <Label className="text-smd 3xl:text-base font-normal">
                Device Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="device_name"
                name="device_name"
                value={deviceDetails.device_name}
                onChange={handleFieldValue}
                placeholder="Enter Device Name"
                className="bg-gray-100 border-EAEAEA shadow-none font-inter rounded-md focus-visible:ring-0 text-xs 3xl:text-md placeholder:font-inter placeholder:text-xs font-light"
              />
              {errorMessages?.device_name && (
                <span className="text-red-500 text-xs font-inter font-light">
                  {errorMessages.device_name}
                </span>
              )}
            </div>
            <div className="flex flex-col space-y-1">
              <Label className="text-smd 3xl:text-base font-normal">
                Device Serial Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="device_serial_number"
                name="device_serial_number"
                value={deviceDetails.device_serial_number}
                onChange={handleFieldValue}
                placeholder="Enter Device Serial Number"
                disabled={isEdit}
                className="bg-gray-100 border-EAEAEA shadow-none font-inter rounded-md focus-visible:ring-0 text-xs 3xl:text-md placeholder:font-inter placeholder:text-xs font-light"
              />
              {errorMessages.device_serial_number && (
                <span className="text-red-500 text-xs font-inter font-light">
                  {errorMessages.device_serial_number}
                </span>
              )}
            </div>
            <div className="flex flex-col space-y-1">
              <Label className="text-smd 3xl:text-base font-normal">User</Label>
              <Select
                value={deviceDetails.userId}
                onValueChange={handleUserChange}
                disabled={isUserDropdownLoading || isUserBasedFlow}
              >
                <SelectTrigger className="bg-gray-100 border-EAEAEA shadow-none font-inter rounded-md text-xs 3xl:text-md">
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {userDropdown.length > 0 ? (
                    userDropdown.map((user: User) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user?.full_name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="">
                      No Users Found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errorMessages.user_id && (
                <span className="text-red-500 text-xs font-inter font-light">
                  {errorMessages.user_id}
                </span>
              )}
            </div>
            <div className="flex flex-col space-y-1">
              <Label className="text-smd 3xl:text-base font-normal">
                Device Location
              </Label>
              <Select
                value={deviceDetails.locationId}
                onValueChange={handleLocationChange}
                disabled={isLocationsLoading || (!deviceDetails.userId && !isUserBasedFlow)}
              >
                <SelectTrigger className="bg-gray-100 border-EAEAEA shadow-none font-inter rounded-md text-xs 3xl:text-md">
                  <SelectValue placeholder="Select Device Location" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {locations.length > 0 ? (
                    locations.map((location: any) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.title}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="text-gray-400 px-4 py-2 text-xs">
                      No data available
                    </div>
                  )}
                </SelectContent>
              </Select>
              {errorMessages.location_id && (
                <span className="text-red-500 text-xs font-inter font-light">
                  {errorMessages.location_id}
                </span>
              )}
            </div>
            <SheetFooter className="fixed right-0 bottom-6 py-2 w-full px-4">
              {!isEdit && (
                <Button
                  variant="outline"
                  onClick={handleDrawerClose}
                  className="text-center text-sm px-7 h-7 border-none font-medium"
                >
                  Cancel
                </Button>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  className="text-center text-sm text-white px-6 h-7 bg-05A155 hover:bg-05A155 font-medium"
                  disabled={isStatusPending || isUpdatePending}
                >
                  {isEdit ? "Update" : "Add"}
                </Button>
                {isEdit && (
                  <Button
                    onClick={handleSync}
                    className="text-center text-sm text-white px-6 h-7 bg-blue-600 hover:bg-blue-700 font-medium"
                    disabled={isSyncPending}
                  >
                    Sync Parameters
                  </Button>
                )}
              </div>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
      {!isEdit && (
        <SyncDeviceDialog
          openSyncParamsDialog={openSyncDialog}
          setOpenSyncParamsDialog={setOpenSyncDialog}
          handleSync={handleSync}
          handleClose={handleClose}
        />
      )}
    </>
  );
};


export default AddApfcDevice;

