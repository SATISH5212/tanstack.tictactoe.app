import { RefObject } from "react";

export interface UsersList {
    id: number;
    full_name: string
}

export interface UserDropdownProps {
    users: UsersList[];
    selectedUser: UsersList | null;
    isUsersLoading: boolean;

    searchString: string;
    setSearchString: (value: string) => void;
    setIsSelectOpen: (open: boolean) => void;
    handleUserChange: (value: string) => void;
    handleClearUser: () => void;
    ispondsRoute?: boolean



}


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
