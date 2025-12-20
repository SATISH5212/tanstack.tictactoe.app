import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createUserAPI } from "@/lib/services/users";

export const useUserMutation = (onSuccessCallback: () => void, setErrors: (e: any) => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["create-user"],
        retry: false,
        mutationFn: createUserAPI,
        onSuccess: () => {
            toast.success("User created successfully");
            queryClient.invalidateQueries({ queryKey: ["users"] });
            onSuccessCallback();
        },
        onError: (response: any) => {
            const status = response?.status;
            const errors = response?.data?.errors || response?.data?.message;

            if (status === 422 && typeof errors === "object") {
                setErrors(errors);
                return;
            }

            toast.error(typeof errors === "string" ? errors : "Unexpected error");
        },
    });

}
