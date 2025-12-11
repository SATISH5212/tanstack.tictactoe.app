import { useState } from "react";
import { Input } from "src/components/ui/input";
import { Button } from "src/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

const PasswordFormFields = ({ name, handleChange, value }: any) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className="relative w-full">
            <Input
                className="pr-10 settings-text-field password-field w-36"
                autoComplete="new-password"
                name={name}
                type={showPassword ? "text" : "password"}
                onChange={handleChange}
                value={value?.[name] || ""}
            />
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={togglePasswordVisibility}
            >
                {showPassword ? (
                    <Eye className="h-4 w-4" />
                ) : (
                    <EyeOff className="h-4 w-4" />
                )}
            </Button>
        </div>
    );
};

export default PasswordFormFields;