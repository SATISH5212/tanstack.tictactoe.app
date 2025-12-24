import { useDeviceMutation } from "@/hooks/devices/useDeviceMutation";
import { EditDeviceSheetProps } from "@/lib/interfaces/devices";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
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


const EditDeviceSheet: React.FC<EditDeviceSheetProps> = ({
  device,
  onClose,
  refetch,
}) => {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    mac_address: "",
    pcb_number: "",
    starter_number: "",
  });

  const { updateDeviceDetailsMutation } = useDeviceMutation({ setErrors });

  useEffect(() => {
    if (!device) return;
    setOpen(true);
    setErrors({});
    setForm({
      name: device.name ?? "",
      mac_address: device.mac_address ?? "",
      pcb_number: device.pcb_number ?? "",
      starter_number: device.starter_number ?? "",
    });
  }, [device]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setErrors((prev) => ({ ...prev, [name]: "" }));

    setForm((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  const handleSave = () => {
    if (!device) return;
    setIsSaving(true);
    updateDeviceDetailsMutation.mutate(
      {
        deviceId: device.id,
        payload: {
          name: form.name,
          pcb_number: form.pcb_number || null,
          mac_address: form.mac_address,
          starter_number: form.starter_number || null,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          onClose();
          refetch();
        },
        onSettled: () => {
          setIsSaving(false);
        },
      }
    );
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setOpen(false);
          onClose();
        }
      }}
    >
      <SheetContent className="bg-white px-6 py-0">
        <SheetHeader>
          <div className="flex justify-between pt-5">
            <SheetTitle>Edit Device</SheetTitle>
            <X
              className="w-5 h-5 cursor-pointer text-red-500"
              onClick={() => {
                setOpen(false);
                onClose();
              }}
            />
          </div>
        </SheetHeader>
        <div className="grid gap-4 pt-4 pb-12">
          <div className="flex flex-col gap-1">
            <Label>Title <span className="text-red-500">*</span></Label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && (
              <span className="text-red-500 text-xs">{errors.name}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label>MAC Address <span className="text-red-500">*</span></Label>
            <Input
              name="mac_address"
              value={form.mac_address}
              disabled
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label>PCB Number <span className="text-red-500">*</span></Label>
            <Input
              name="pcb_number"
              value={form.pcb_number}
              onChange={handleChange}
            />
            {errors.pcb_number && (
              <span className="text-red-500 text-xs">
                {errors.pcb_number}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label>Device Box Number <span className="text-red-500">*</span></Label>
            <Input
              name="starter_number"
              value={form.starter_number}
              onChange={handleChange}
            />
            {errors.starter_number && (
              <span className="text-red-500 text-xs">
                {errors.starter_number}
              </span>
            )}
          </div>
        </div>

        <SheetFooter className="flex justify-end gap-2 pb-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : "Update"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EditDeviceSheet;
