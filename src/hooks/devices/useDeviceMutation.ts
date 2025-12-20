import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addDeviceAPI } from "@/lib/services/deviceses";

export const useDeviceMutation = (onSuccessCallback: () => void, setErrors: (e: any) => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["add-device"],
        retry: false,
        mutationFn: addDeviceAPI,
        onSuccess: () => {
            toast.success("Device added successfully");
            queryClient.invalidateQueries({ queryKey: ["devices"] });
            onSuccessCallback();
        },
        onError: (error: any) => {
            if (error?.status === 409) {
                const msg = error?.data?.message || "Device already exists";
                setErrors({ general: msg });
                toast.error(msg);
                return;
            }

            if (error?.status === 422) {
                setErrors(error?.data?.errors || {});
                return;
            }

            toast.error(error?.data?.message || "Something went wrong");
        },
    });

}
