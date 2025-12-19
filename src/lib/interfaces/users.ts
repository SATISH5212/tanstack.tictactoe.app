import { RefObject } from "react";
export interface UserProfileDropdownProps {
    menuRef: RefObject<HTMLDivElement | null>;
    isSuperAdmin: boolean;
    isOwner: boolean;
    fullName: string;
    shortName: string;
    initial: string;
    onNavigate: (path: string) => void;
    onUpdatePassword: () => void;
}
export interface UserFormData {
    full_name: string;
    email: string;
    phone: string;
    address: string;
}
