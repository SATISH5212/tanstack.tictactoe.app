
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; 
import { Label } from '../ui/label';
import { Input } from '../ui/input';

const PasswordInput = ({ name, value, onChange, label }: { name?: string; value?: string; onChange?: any; label?: string; }) => {
    const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="space-y-1">
            <Label htmlFor={name} className="text-xs 3xl:text-sm text-gray-600">
                {label}
            </Label>
            <div className="relative w-3/5">
                <Input
                    id={name}
                    type={showPassword ? 'text' : 'password'}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="h-8 w-full rounded-md border-gray-300 text-sm pr-10"
                />
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                >
                    {showPassword ? (
                        <Eye className="size-4" />
                    ) : (
                        <EyeOff className="size-4" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default PasswordInput;