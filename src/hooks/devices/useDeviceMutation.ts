import { UseDeviceMutationProps } from "@/lib/interfaces/devices";
import {
    addDeviceAPI,
    updateDeviceDetailsAPI,
    updateDeviceStatusAPI,
} from "@/lib/services/devices";
import { deleteUsersDeviceAPI } from "@/lib/services/users";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
    const updateDeviceStatusMutation = useMutation({
        mutationKey: ["update-device-status"],
        mutationFn: ({
            deviceId,
            status,
        }: {
            deviceId: number;
            status: string;
        }) => updateDeviceStatusAPI(deviceId, { deploy_status: status }),

        onSuccess: (_res, { deviceId, status }) => {
            toast.success("Device status updated");
            queryClient.setQueryData(["devices"], (oldData: any) => {
                if (!oldData?.pages) return oldData;

                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => ({
                        ...page,
                        data: page.data.map((device: any) =>
                            device.id === deviceId
                                ? { ...device, device_status: status }
                                : device
                        ),
                    })),
                };
            });
        },

        onError: (error: any) => {
            toast.error(error?.data?.message || "Failed to update device status");
        },
    });

    const updateDeviceDetailsMutation = useMutation({
        mutationKey: ["update-device-details"],
        mutationFn: ({
            deviceId,
            payload,
        }: {
            deviceId: number;
            payload: any
        }) => updateDeviceDetailsAPI(deviceId, payload),
        onSuccess: (res,) => {
            toast.success(res?.data?.message);
        },

        onError: (error: any) => {
            if (error?.status === 422) {
                setErrors?.(error?.data?.errors || {});
                return;
            }

            toast.error(error?.data?.message || "Failed to update device status");
        },
    });


    const deleteDeviceMutation = useMutation({
        mutationKey: ["delete-device"],
        mutationFn: deleteUsersDeviceAPI,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["devices"] });
            toast.success("Device deleted successfully");
        },
        onError: (error: any) => {
            toast.error(
                error?.data?.message ||
                "Starter box is connected to motors and cannot be deleted"
            );
        },
    });

    return {
        addDeviceMutation,
        updateDeviceStatusMutation,
        deleteDeviceMutation,
        updateDeviceDetailsMutation,
    };
};
