import { Loader2, X } from "lucide-react";
import { useState } from "react";
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
} from "src/components/ui/sheet";
import { EditDeviceSheetProps } from "src/lib/interfaces";
import {
  updateDeviceUsersAPI,
} from "@/lib/services/devices";
const EditDeviceSheet: React.FC<EditDeviceSheetProps> = ({
  device,
  onClose,
  refetch,
}) => {
  const [deviceData, setDeviceData] = useState({
    title: "",
    mcu_serial_no: "",
    mac_address: "",
    pcb_number: "",
    starter_number: "",
    gateway_id: "",
    gateway_name: "",
  });
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const alphanumericFields = [
      "title",
      "mcu_serial_no",
      "pcb_number",
      "starter_number",
    ];
    let filteredValue = value;
    if (alphanumericFields.includes(name)) {
      filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, "").toUpperCase();
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
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrors(null);
    try {
      const response = await updateDeviceUsersAPI(device?.id, {
        mcu_serial_no: deviceData.mcu_serial_no,
        title: deviceData.title,
        mac_address: deviceData.mac_address,
        gateway_id: deviceData.gateway_id
          ? Number(deviceData.gateway_id)
          : null,
        pcb_number: deviceData.pcb_number,
        starter_number: deviceData.starter_number
          ? deviceData.starter_number
          : null,
      });

      if (response?.status === 200 || response?.status === 201) {
        toast.success("Device updated successfully");
        onClose();
        refetch();
      } else if (response?.status === 422) {
        setErrors(response?.data?.errors || {});
      } else if (response?.status === 409) {
        const errorMessage = response?.data?.message || "Device already exists";
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error(error);
      if (error?.status === 422) {
        setErrors(error?.data?.errors || {});
      } else if (error?.status === 409) {
        const errorMessage = error?.data?.message;
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
      } else {
        toast.error(error?.message || "Failed to update device");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleGatewaySelect = (gatewayId: string) => {
    setDeviceData((prev) => ({
      ...prev,
      gateway_id: gatewayId,
    }));
    setOpen(false);
  };

 

  return (
    <Sheet open={!!device} onOpenChange={onClose}>
      <SheetContent className="bg-white w-custom_40per sm:max-w-custom_30per  min-w-custom_30per  max-w-custom_30per   duration-200 translate-x-0 [&>button]:bg-white [&>button]:border [&>button]:border-slate-200 [&>button]:p-1 [&>button]:hover:bg-slate-100 [&>button]:rounded-md [&>button]:top-6  [&>button>svg]:size-4 [&>button>svg]:cursor-pointer px-6 py-0">
        <SheetHeader>
          <div className="flex justify-between item-center pt-5 ">
            <SheetTitle className="font-inter text-black/80 font-normal text-md 3xl:text-lg p-0">
              Edit Device
            </SheetTitle>
            <button>
              <X
                className="w-6 h-6 cursor-pointer text-red-500 p-1 rounded-full hover:bg-red-100 hover:text-red-600"
                onClick={() => onClose()}
              />
            </button>
          </div>
        </SheetHeader>

        <div className="grid gap-4 pt-3 pb-12">
          <div className="flex flex-col space-y-1">
            <Label
              className="text-smd 3xl:text-base font-normal  "
              htmlFor="firstname"
            >
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              className="font-inter border border-slate-200 shadow-none bg-gray-100 focus-visible:ring-0 placeholder:font-inter placeholder:text-xs font-light"
              placeholder="Enter Title"
              id="title"
              name="title"
              value={deviceData.title ? deviceData.title : ""}
              onChange={handleChange}
              maxLength={30}
            />
            <div className="m-1">
              {errors?.title && (
                <span className="text-red-500 text-xs font-inter font-light">
                  {errors.title}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <Label
              className="text-smd 3xl:text-base font-normal  "
              htmlFor="firstname"
            >
              MCU Serial No <span className="text-red-500">*</span>
            </Label>
            <Input
              id="mcu_serial_no"
              name="mcu_serial_no"
              value={deviceData.mcu_serial_no ? deviceData.mcu_serial_no : ""}
              onChange={handleChange}
              className="font-inter border border-slate-200 shadow-none bg-gray-100 focus-visible:ring-0 placeholder:font-inter placeholder:text-xs font-light"
              placeholder="Enter MCU Serial Number"
            />
            <div className="mt-1 flex items-center">
              {errors?.mcu_serial_no && (
                <span className="text-red-500 text-xs font-inter font-light">
                  {errors.mcu_serial_no}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <Label
              className="text-smd 3xl:text-base font-normal  "
              htmlFor="firstname"
            >
              MAC Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="mac_address"
              name="mac_address"
              value={deviceData.mac_address ? deviceData.mac_address : ""}
              className="bg-gray-200 border-gray-300 shadow-none font-inter rounded-md focus-visible:ring-0 text-xs 3xl:text-md placeholder:font-inter placeholder:text-xs font-normal"
              placeholder="Enter MAC Address"
              disabled
            />
            <div className="mt-1 flex items-center">
              {errors?.mac_address && (
                <span className="text-red-500 text-xs font-inter font-light">
                  {errors.mac_address}
                </span>
              )}
            </div>
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
              value={deviceData.pcb_number ? deviceData.pcb_number : ""}
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
              value={deviceData.starter_number ? deviceData.starter_number : ""}
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
        <SheetFooter className="fixed right-0 bottom-6 py-2 w-full] px-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-center  text-sm px-7 h-7 border border-gray-200 font-medium"
          >
            Cancel
          </Button>
          <Button
            className="text-center m-auto flex justify-center text-sm text-white px-6 h-7 bg-green-500 hover:bg-green-600 font-medium"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="animate-spin" /> : "update"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EditDeviceSheet;
