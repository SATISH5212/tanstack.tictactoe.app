import { useUserMutation } from "@/hooks/users/useUserMutation";
import { IAddDeviceOrUserFormProps } from "@/lib/interfaces/devices";
import { UserFormData } from "@/lib/interfaces/users";
import { Loader2 } from "lucide-react";
import { FC, useState } from "react";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
const INITIAL_USER_DATA: UserFormData = {
    full_name: "",
    email: "",
    phone: "",
    address: "",
};

const AddUserForm: FC<IAddDeviceOrUserFormProps> = (props) => {
    const { userId, onClose } = props
    const [formData, setFormData] = useState(INITIAL_USER_DATA);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { mutateAsync, isPending } = useUserMutation(() => {
        setFormData(INITIAL_USER_DATA);
        setErrors({});
        onClose();
    }, setErrors);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const updated = name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;
        setFormData((prev) => ({ ...prev, [name]: updated }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async () => {
        await mutateAsync({
            ...formData,
            user_type: "USER",
            created_by: userId,
        });
    };

    return (
        <>
            <div className="grid gap-4 pt-2 pb-12">
                {[
                    { key: "full_name", label: "Full Name" },
                    { key: "email", label: "Email" },
                    { key: "phone", label: "Phone Number" },
                    { key: "address", label: "Address" },
                ].map(({ key, label }) => (
                    <div key={key} className="space-y-1">
                        <Label className="text-gray-700">
                            {label}
                            {key !== "address" && (
                                <span className="text-red-500"> *</span>
                            )}
                        </Label>
                        <Input
                            name={key}
                            value={(formData as any)[key]}
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
                    <Button onClick={handleSubmit} disabled={isPending} className="bg-blue-500 text-white shadow-sm">
                        {isPending ? <Loader2 className="animate-spin" /> : "Add"}
                    </Button>

                </div>
            </div>


        </>
    );
};

export default AddUserForm;
