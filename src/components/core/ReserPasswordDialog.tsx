import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "src/components/ui/dialog";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { Eye, EyeOff, X } from "lucide-react";
import { toast } from "sonner";

interface ResetPasswordDialogProps {
    apfc_id: string;
    updateDevicePassword: (apfc_id: string, payload: { password: string }) => Promise<void>;
    open: boolean;
    closeDialog: () => void;
    refetchLevel1Data: () => void;
}

const ResetPasswordDialog = ({
    apfc_id,
    updateDevicePassword,
    open,
    closeDialog,
    refetchLevel1Data
}: ResetPasswordDialogProps) => {
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const mutation = useMutation({
        mutationFn: () => updateDevicePassword(apfc_id, { password: newPassword }),
        onSuccess: () => {
            toast.success("Password updated successfully");
            setNewPassword("");
            refetchLevel1Data();
            closeDialog();
            closeDialog();
        },
        onError: (error) => {
            console.error("Failed to update password:", error);
            toast.error("Failed to update password");
        },
    });

    const handleSubmit = () => {
        if (!newPassword) {
            toast.error("Please enter a new password");
            return;
        }
        mutation.mutate();
    };

    return (
        <Dialog open={open} onOpenChange={closeDialog}>
            <DialogContent className="max-w-96 rounded-lg bg-white p-4  [&>button]:hidden">
                <DialogHeader className="flex flex-row items-center justify-between border-0 p-0  ">
                    <DialogTitle className="text-base font-normal text-black sm:text-lg  ">
                        Reset Password
                    </DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded bg-gray-200 p-0 text-black hover:bg-gray-300 "
                        onClick={closeDialog}
                        aria-label="Close"
                    >
                        <X className="size-6" />
                    </Button>
                </DialogHeader>
                <div className="mt-4 p-0">
                    <Label
                        htmlFor="new-password"
                        className="text-xs font-normal text-black sm:text-sm"
                    >
                        New Password
                    </Label>
                    <div className="relative mt-1">
                        <Input
                            id="new-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            autoComplete="new-password"
                            className="h-8 w-full rounded border border-gray-300 bg-white text-xs text-gray-500 placeholder:text-gray-400 focus:border-secondary focus:ring-0 sm:text-sm"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 p-0"
                            onClick={togglePasswordVisibility}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                            )}
                        </Button>
                    </div>
                </div>
                <DialogFooter className="mt-6 flex justify-end gap-2 p-0">
                    <Button
                        variant="ghost"
                        className="px-4 py-1 text-xs font-normal text-red-500  hover:text-red-500 sm:text-sm border border-gray-200" 
                        onClick={closeDialog}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="default"
                        className="bg-red-500 hover:bg-red-500 px-5 py-1 text-xs font-normal text-white hover:bg-secondary-dark sm:text-sm"
                        onClick={handleSubmit}
                        disabled={!newPassword || mutation.isPending}
                    >
                        {mutation.isPending ? "Updating..." : "Update Password"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ResetPasswordDialog;