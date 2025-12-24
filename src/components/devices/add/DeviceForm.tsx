import { useDeviceMutation } from "@/hooks/devices/useDeviceMutation";
import { DeviceFormData } from "@/lib/interfaces/devices";
import { Loader2 } from "lucide-react";
import { FC, useCallback, useEffect, useState } from "react";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";

interface DeviceFormProps {
  userId?: string
  mode: "add" | "edit";
  initialData?: Partial<DeviceFormData> & { id?: string };
  onClose: () => void;
  onSuccess?: () => void;
}

const EMPTY_FORM: DeviceFormData = {
  name: "",
  mac_address: "",
  pcb_number: "",
  starter_number: "",
};

const DeviceForm: FC<DeviceFormProps> = ({
  mode,
  initialData,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState<DeviceFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    addDeviceMutation,
    updateDeviceDetailsMutation,
  } = useDeviceMutation({ setErrors });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({
        ...EMPTY_FORM,
        ...initialData,
      });
    }
  }, [mode, initialData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
        let sanitized = value.replace(/[^a-zA-Z0-9\s:]/g, "").toUpperCase();

    if (name === "mac_address") {
      sanitized = sanitized.match(/.{1,2}/g)?.join(":") ?? "";
    }

    if (name === "name") {
      sanitized = sanitized.replace(/\s+/g, " ").trimStart();
      if (sanitized) {
        sanitized =
          sanitized.charAt(0) + sanitized.slice(1).toLowerCase();
      }
    }

    setForm(prev => ({ ...prev, [name]: sanitized }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  },
    [errors]
  );

  const handleSubmit = async () => {
    const payload = {
      ...form,
      mac_address: form.mac_address.replace(/:$/, ""),
      pcb_number: form.pcb_number || null,
      starter_number: form.starter_number || null,
    };

    if (mode === "add") {
      await addDeviceMutation.mutateAsync(payload);
    } else {
      await updateDeviceDetailsMutation.mutateAsync({
        deviceId: Number(initialData!.id),
        payload,
      });
    }

    onSuccess?.();
    onClose();
    setForm(EMPTY_FORM);
  };

  const isLoading =
    addDeviceMutation.isPending ||
    updateDeviceDetailsMutation.isPending;

  return (
    <div className="grid gap-4 pt-2 pb-10">
      {[
        { key: "name", label: "Name" },
        { key: "mac_address", label: "MAC Address", disabled: mode === "edit" },
        { key: "pcb_number", label: "PCB Number" },
        { key: "starter_number", label: "Device Box Number" },
      ].map(({ key, label, disabled }) => (
        <div key={key} className="space-y-1">
          <Label className="text-sm font-normal">
            {label} <span className="text-red-500">*</span>
          </Label>
          <Input
            name={key}
            value={(form as any)[key]}
            onChange={handleChange}
            disabled={disabled}
            className="bg-gray-100"
          />
          {errors[key] && (
            <span className="text-red-500 text-xs">{errors[key]}</span>
          )}
        </div>
      ))}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading} className={`h-[30px]  ${mode === "edit" ? "bg-orange-500 hover:bg-orange-600" : "hover:bg-blue-600 bg-blue-500"}  text-white shadow-sm text-sm font-medium rounded-md transition-all`}>
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : mode === "add" ? (
            "Add Device"
          ) : (
            "Edit Device"
          )}
        </Button>
      </div>
    </div>
  );
};

export default DeviceForm;
