import { useDeviceMutation } from "@/hooks/devices/useDeviceMutation";
import {
  DeviceFormData,
  IAddDeviceOrUserFormProps,
} from "@/lib/interfaces/devices";
import { Loader2 } from "lucide-react";
import { FC, useCallback, useState } from "react";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
const INITIAL_DEVICE_DATA: DeviceFormData = {
  name: "",
  mac_address: "",
  pcb_number: "",
  starter_number: "",
};

const AddDeviceForm: FC<IAddDeviceOrUserFormProps> = (props) => {
  const { onClose } = props;
  const [deviceData, setDeviceData] = useState(INITIAL_DEVICE_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutateAsync, isPending } = useDeviceMutation(() => {
    setDeviceData(INITIAL_DEVICE_DATA);
    setErrors({});
    onClose();
  }, setErrors);

  const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
          const { name, value } = e.target;
          let sanitized = value.replace(/[^a-zA-Z0-9\s]/g, "").toUpperCase();
          
      if (name === "mac_address") {
        sanitized = sanitized.match(/.{1,2}/g)?.join(":") ?? "";

        setDeviceData((prev) => ({ ...prev, mac_address: sanitized }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
        return;
      }
          if (name === "name") {
              sanitized = sanitized.replace(/\s+/g, " ").trimStart();
              if (sanitized){
                 sanitized = sanitized.charAt(0) + sanitized.slice(1).toLowerCase();
              }
          }
          setDeviceData((prev) => ({
              ...prev,
              [name]: sanitized,
          }));

          if (errors[name]) {
              setErrors((prev) => ({ ...prev, [name]: "" }));
          }
      }, [errors]);

  const handleSubmit = async () => {
    let mac = deviceData.mac_address;
    if (mac.endsWith(":")) mac = mac.slice(0, -1);

    const payload = {
      ...deviceData,
      mac_address: mac.toUpperCase(),
      pcb_number: deviceData.pcb_number.toUpperCase(),
      starter_number: deviceData.starter_number
        ? deviceData.starter_number.toUpperCase()
        : null,
    };

    await mutateAsync(payload);
  };

  return (
    <>
      <div className="grid gap-4 pt-2 pb-12 ">
        {[
          { key: "name", label: "Device Name" },
          { key: "mac_address", label: "MAC Address" },
          { key: "pcb_number", label: "PCB Number" },
          { key: "starter_number", label: "Serial Number" },
        ].map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <Label className="text-gray-700">
              {label} <span className="text-red-500">*</span>
            </Label>
            <Input
              name={key}
              value={(deviceData as any)[key]}
              onChange={handleChange}
              className="bg-gray-100 shadow-none focus-visible:ring-0"
            />
            {errors[key] && (
              <span className="text-red-500 text-xs">{errors[key]}</span>
            )}
          </div>
        ))}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-blue-500 text-white shadow-sm hover:bg-blue-600 "
          >
            {isPending ? <Loader2 className="animate-spin" /> : "Add"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default AddDeviceForm;
