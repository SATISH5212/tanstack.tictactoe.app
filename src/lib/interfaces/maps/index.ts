import { MapboxFeature } from "@/hooks/maps/useMapSearchFilter";
import { Motor, MotorAddData, PondData } from "./ponds";

import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { Dispatch } from "react";

export interface UseMapBoxReturn {
    // Core refs
    drawRef: React.RefObject<MapboxDraw | null>;
    previewMotorMarkerRef: React.RefObject<mapboxgl.Marker | null>;
    historyRef: React.RefObject<any[]>;
    redoHistoryRef: React.RefObject<any[]>;

    // Pond state
    pond: PondData | null;
    setPond: (pond: PondData | null) => void;
    drawMode: string;
    locationCentroid: number[];

    // Pond drawing functions
    processDrawNewPond: (feature: any) => void;
    processUpdatePond: (feature: any) => void;
    handleLineStringMode: () => void;
    handlePolygonMode: () => void;
    handleEdit: () => void;
    handleDeletePond: () => void;
    handleUndo: () => void;
    handleRedo: () => void;
    handleCancel: () => void;

    // Motor management functions
    handleAddMotor: () => void;
    handleDeleteMotor: (motorId: number) => void;
    handleMotorNameChange: (motorId: number, newName: string) => void;
    handleMotorPowerChange: (motorId: number, newPower: string) => void;

    // Motor state
    isAddingMotor: boolean;
    setIsAddingMotor: (isAdding: boolean) => void;

    // Utility functions
    RemoveAllMotorMarkers: () => void;

    // UI state
    canUndo: boolean;
    canRedo: boolean;
}
export interface IMapSarchBox {
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    searchResults: MapboxFeature[];
    isSearching: boolean;
    showResults: boolean;
    selectLocation: (feature: MapboxFeature) => void;
    clearSearch: () => void;
    isAddingLocation?: boolean;
    lastSelectedFeatureRef?: React.MutableRefObject<MapboxFeature | null>;
    setShowResults?: React.Dispatch<React.SetStateAction<boolean>>;
    setErrors?: React.Dispatch<React.SetStateAction<any>>;
    isMapPage?: boolean;
}

export interface UseMapBoxProps {
    map: React.MutableRefObject<mapboxgl.Map | null>;
    isMapLoaded: boolean;
    isPondAdding: boolean;
    setIsPondAdding: React.Dispatch<React.SetStateAction<boolean>>;
    AddMotorMarkerToPond: (motor: MotorAddData) => mapboxgl.Marker | null;
    pondsLayersAddedRef: React.MutableRefObject<boolean>;
}

export interface IMotorMarkerTooltipProps {
    motor: Motor;
}

