import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addDeviceAPI } from "@/lib/services/deviceses";
import { deleteUsersDeviceAPI } from "@/lib/services/users";
import { UseDeviceMutationProps } from "@/lib/interfaces/devices";


export const useDeviceMutation = ({
    onAddSuccess,
    setErrors,
}: UseDeviceMutationProps = {}) => {
    const queryClient = useQueryClient();

    const addDeviceMutation = useMutation({
        mutationKey: ["add-device"],
        retry: false,
        mutationFn: addDeviceAPI,
        onSuccess: () => {
            toast.success("Device added successfully");
            queryClient.invalidateQueries({ queryKey: ["devices"] });
            onAddSuccess?.();
        },
        onError: (error: any) => {
            if (error?.status === 409) {
                const msg = error?.data?.message || "Device already exists";
                setErrors?.({ general: msg });
                toast.error(msg);
                return;
            }

            if (error?.status === 422) {
                setErrors?.(error?.data?.errors || {});
                return;
            }

            toast.error(error?.data?.message || "Something went wrong");
        },
    });

    const deleteDeviceMutation = useMutation({
        mutationKey: ["delete-device"],
        mutationFn: deleteUsersDeviceAPI,
        onMutate: async (deviceId: string) => {
            await queryClient.cancelQueries({ queryKey: ["devices"] });

            const previousData = queryClient.getQueryData(["devices"]);

            queryClient.setQueryData(["devices"], (old: any) => {
                if (!old?.pages) return old;

                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        data: page.data.filter((d: any) => d.id !== deviceId),
                    })),
                };
            });

            return { previousData };
        },
        onSuccess: () => {
            toast.success("Device deleted successfully");
        },
        onError: (error: any, _deviceId, context) => {
            queryClient.setQueryData(["devices"], context?.previousData);
            toast.error(
                error?.data?.message ||
                "Starter box is connected to motors and cannot be deleted"
            );
        },
    });

    return {
        addDeviceMutation,
        deleteDeviceMutation,
    };
};
