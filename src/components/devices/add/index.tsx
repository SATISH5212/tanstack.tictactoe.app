"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import mqtt from "mqtt";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  addDeviceAPI
} from "src/lib/services/deviceses";

const AddDevice = ({ refetchDevices, gatewayId }: any) => {
  const queryClient = useQueryClient();
  // const { user_id } = useParams({ strict: false });
  const [isRefetching, setIsRefetching] = useState(false);
  const [gateways, setGateways] = useState<any[]>([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [motorsOpen, setMotorsOpen] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectStatus, setConnectStatus] = useState<
    "Connected" | "Disconnected" | "Error"
  >("Disconnected");

  const [isMounted, setIsMounted] = useState(false);
  const isInitialMount = useRef(true);
  // const lastUserId = useRef(user_id);
  const initialDeviceData = useMemo(
    () => ({
      name: "",
      mac_address: "",
      pcb_number: "",
      starter_number: "",
      // user_id: user_id ? Number(user_id) : null,
    }),
    []
  );

  const [deviceData, setDeviceData] = useState(initialDeviceData);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // useEffect(() => {
  //   if (lastUserId.current !== user_id) {
  //     lastUserId.current = user_id;
  //     setDeviceData(initialDeviceData);
  //     setGateways([]);
  //     setErrors({});
  //     if (!isInitialMount.current) {
  //       queryClient.invalidateQueries({
  //         queryKey: ["getAllgateways", user_id],
  //       });
  //     }
  //   }
  //   isInitialMount.current = false;
  // }, [user_id, initialDeviceData, queryClient]);

  const { mutateAsync: mutateAddDevice, isPending: isStatusPending } =
    useMutation({
      mutationKey: ["add-device"],
      retry: false,
      mutationFn: async (data: any) => {
        const response = await addDeviceAPI(data);
        return response;
      },
      onSuccess: useCallback(
        async (response: any) => {
          toast.success("Device Added Successfully");
          const settingsData = response?.data?.data;
          setDeviceData(initialDeviceData);
          setErrors({});
          setIsRefetching(true);
          if (window.location.pathname.startsWith("/devices")) {
            queryClient.invalidateQueries({ queryKey: ["devices"] });
          } else {
            queryClient.invalidateQueries({ queryKey: ["eachUserDevices"] });
          }

          setIsRefetching(false);
          setIsOpen(false);
        },
        [client, isConnected,initialDeviceData, queryClient]
      ),

      onError: useCallback((error: any) => {
        if (error?.status === 409) {
          const errorMessage = error?.data?.message || "Device already exists";
          setErrors({ general: errorMessage });
          toast.error(errorMessage);
        } else if (error?.status === 422) {
          setErrors(error?.data?.errors || {});
        } else {
          toast.error(error?.data?.message);
        }
      }, []),
    });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const alphanumericFields = [
        "name",
        "pcb_number",
        "starter_number",
      ];
      let filteredValue = value;
      if (alphanumericFields.includes(name)) {
        filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, "");
      }
      if (name === "name") {
        filteredValue = filteredValue.replace(/\s+/g, " ").trimStart();

        if (filteredValue.length > 0) {
          const isAllCaps = filteredValue === filteredValue.toUpperCase();

          if (isAllCaps) {
            filteredValue = filteredValue;
          } else {
            filteredValue =
              filteredValue.charAt(0).toUpperCase() + filteredValue.slice(1);
          }
        }
      }

      if (name === "mcu_serial_no" && filteredValue) {
        setErrors((prev: Record<string, string | null>) => ({
          ...prev,
          mcu_serial_no: null,
          mac_address: null,
        }));
      } else if (filteredValue && errors[name]) {
        setErrors((prev: Record<string, string | null>) => ({
          ...prev,
          [name]: null,
        }));
      }

      if (name === "mcu_serial_no") {
        const macAddress = filteredValue
          ? filteredValue.match(/.{1,2}/g)?.join(":") || ""
          : "";
        setDeviceData((prev) => ({
          ...prev,
          [name]: filteredValue,
          mac_address: macAddress,
        }));
      } else {
        setDeviceData((prev) => ({
          ...prev,
          [name]:
            name === "gateway_id" || name === "user_id"
              ? filteredValue
                ? Number(filteredValue)
                : null
              : filteredValue,
        }));
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(async () => {
    try {
      const formattedData = {
        ...deviceData,
        name: deviceData.name,
        mac_address: deviceData.mac_address.toUpperCase(),
        pcb_number: deviceData.pcb_number.toUpperCase(),
        starter_number: deviceData.starter_number
          ? deviceData.starter_number.toUpperCase()
          : null,
      };
      await mutateAddDevice(formattedData);
    } catch (error) {
      console.error("Submit Error:", error);
    }
  }, [deviceData, gatewayId,mutateAddDevice]);

  const handleDrawerClose = useCallback(() => {
    setErrors({});
    setDeviceData(initialDeviceData);
    setIsOpen(false);
    setGateways([]);
  }, [initialDeviceData]);

  const handleOpenModal = useCallback(() => {
    setIsOpen(true);
    setGateways([]);
  }, []);

  return (
    <div className="add-device-container">
      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          if (open !== isOpen) {
            setIsOpen(open);
            if (!open) {
              handleDrawerClose();
            }
          }
        }}
      >
        <SheetTrigger asChild>
          <Button
            onClick={handleOpenModal}
            className="h-7 px-4 bg-blue-500 hover:bg-blue-600 rounded flex items-center gap-1 text-white text-xs 3xl:text-sm cursor-pointer font-normal"
            disabled={isStatusPending}
          >
            <span>+ Add</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="bg-white w-custom_40per sm:max-w-custom_30per min-w-custom_30per max-w-custom_30per px-6 py-0 font-inter [&>button]:hidden overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center justify-between pt-2">
              <SheetTitle className="font-inter text-black/80 font-normal text-md 3xl:text-lg">
                Add Device
              </SheetTitle>
              <button>
                <X
                  className="w-6 h-6 cursor-pointer text-red-500 p-1 rounded-full hover:bg-red-100 hover:text-red-600"
                  onClick={() => handleDrawerClose()}
                />
              </button>
            </div>
          </SheetHeader>
          <div className="grid gap-4 pt-2 pb-12">
            <div className="flex flex-col space-y-1">
              <Label className="text-sm 3xl:text-base font-normal">
                Device Name <span className="text-red-500">*</span>
              </Label>
              <Input
                className="bg-gray-100 border-gray-200 shadow-none font-inter rounded-md focus-visible:ring-0 text-xs 3xl:text-md placeholder:font-inter placeholder:text-xs font-light"
                placeholder="Enter Name"
                id="name"
                name="name"
                value={deviceData.name}
                onChange={handleChange}
                maxLength={30}
              />
              {errors?.name && (
                <span className="text-red-500 text-xs font-inter font-light mt-1">
                  {errors.name}
                </span>
              )}
            </div>
  
            <div className="flex flex-col space-y-1">
              <Label className="text-sm 3xl:text-base font-normal">
                MAC Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="mac_address"
                placeholder="Enter MAC Address"
                name="mac_address"
                value={deviceData.mac_address.toUpperCase() || ""}
                className="font-inter shadow-none border-none bg-gray-100 focus-visible:ring-0 placeholder:font-inter placeholder:text-xs font-light"
                onChange={handleChange}
              />
              {errors?.mac_address && (
                <span className="text-red-500 text-xs font-inter font-light mt-1">
                  {errors.mac_address}
                </span>
              )}
            </div>
            <div className="flex flex-col space-y-1">
              <Label className="text-sm 3xl:text-base font-normal">
                PCB Number <span className="text-red-500">*</span>
              </Label>
              <Input
                className="shadow-none border border-gray-200 rounded-md bg-gray-100 font-inter focus-visible:ring-0 placeholder:font-inter placeholder:text-xs font-light"
                placeholder="Enter PCB Number"
                id="pcb_number"
                name="pcb_number"
                value={deviceData.pcb_number.toUpperCase()}
                onChange={handleChange}
              />
              {errors?.pcb_number && (
                <span className="text-red-500 text-xs font-inter font-light mt-1">
                  {errors.pcb_number}
                </span>
              )}
            </div>
            <div className="flex flex-col space-y-1">
              <Label className="text-sm 3xl:text-base font-normal">
                Starter Box Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="starter_number"
                placeholder="Enter Starter Box Number"
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

          </div>
          <SheetFooter className="absolute bottom-2 right-4 py-2 w-full">
            <Button
              variant="outline"
              onClick={handleDrawerClose}
              className="text-center text-sm px-4 h-7 border border-gray-200 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="text-center flex justify-center text-sm text-white px-6 h-7 bg-blue-500 hover:bg-blue-600 font-medium"
              disabled={isStatusPending}
            >
              {isStatusPending ? <Loader2 className="animate-spin" /> : "Add"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AddDevice;
