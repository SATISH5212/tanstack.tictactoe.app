import React, { Dispatch, RefObject, SetStateAction } from "react";
import { IUserLocation } from "./maps/ponds";

export interface User {
    id: number;
    full_name: string;
    pond_count: number;
    gateways: { id: number; title: string } | null;
    ponds?: Array<{ id: number }>;
    locations?: any;
}

export interface GatewayColumnProps {
    user: { id: string };
}

export interface LocationFormData {
    title: string;
    user_id: any;
    gateway_title: string | null;
    location_coordinates: { lat: number; lng: number };
}

export interface GatewayFormData {
    id?: number;
    title: string;
    location_id: number;
    user_id: any;
    status: "ACTIVE" | "INACTIVE";
}

export interface StarterBox {
    id: number;
    title: string;
    ipv6: string;
    serial_no: string;
    gateway_id: number;
}

export interface Gateway {
    id: number;
    title: string
    // starter_boxes

}

export interface Gateways {

    id: number,
    title: string
    starter_boxes: [
        {
            id: number,
            title: string,
            mcu_serial_no: string,
            current_gateway_id: number,
            ipv6: string
        }
    ]
}


export interface Location {
    id: number;
    title: string;
    gateways: Gateways[];
    location_coordinates?: {
        lat: number;
        lng: number;
    };
}

export interface ILocationBlock {
    handleSubmitNewLocation: (e: React.FormEvent) => void
    formData: LocationFormData
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleCancelAddLocation: (e: React.MouseEvent) => void
    isStatusPending: boolean
    errormessage: string
    errors: Record<string, string | null>
    setFormData: Dispatch<SetStateAction<LocationFormData>>
    setErrors: Dispatch<SetStateAction<Record<string, string | null>>>
}

export interface IGateWaySettingsBlock {
    gatewayData: any,
    selectedLocation: Location | null
    setSelectedLocation: React.Dispatch<React.SetStateAction<Location | null>>;
    handleAddGateway: (e: React.MouseEvent, locationId: number) => void
    editingGatewayId: number | null, gatewayFormData: GatewayFormData,
    handleGatewayChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    isStatusPendingUpdate: boolean,
    handleCancelEditGateway: (e: React.MouseEvent) => void,
    expandedGateway: number | null
    toggleGatewayExpand: (gatewayId: number) => void,
    gatewayErrors: Record<string, string | null>
    handleDeleteGateway: (gatewayId: number) => void,
    addingGatewayRow: number | null,
    handleSubmitNewGateway: (e: React.FormEvent) => void
    handleSubmitUpdateGateway: (e: React.FormEvent) => void
    handleEditGateway: (gatewayId: number) => void
    gatewayErrormessage: string
    handleCancelAddGateway: (e: React.MouseEvent) => void
    isStatusPendingGateway: boolean
}


export interface LocationDropdownProps {
    pond?: { location?: number | string };
    locations: IUserLocation[]
    isLocationsLoading: boolean;

    searchString: string;
    setSearchString: (value: string) => void;
    setIsSelectOpen: (open: boolean) => void;
    handlePondLocationChange: (value: string) => void;
    selectedLocation?: IUserLocation | null
    handleClearLocation: () => void;
    ispondsRoute?: boolean



}


export interface LocationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    locationId?: number | null;
    initialTitle?: string;
    initialCoordinates?: { lat: number; lng: number };
    isEditMode?: boolean;
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


export interface EditPasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title: string) => void;
    isPending: boolean;
    errorMessage: string | null;
    setErrorMessage: (message: string | null) => void;
    updatePassword: string;
    setUpdatePassword: (title: string) => void;
}

export interface UsersList {
    id: number;
    full_name: string
}