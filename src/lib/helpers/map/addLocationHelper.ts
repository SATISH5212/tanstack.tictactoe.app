import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_MAP_API_KEY as string;

interface LocationCoordinates {
    lng: number;
    lat: number;
}

interface LocationData {
    title: string;
    location_coordinates?: LocationCoordinates;
}

interface UseAddLocationReturn {
    searchQuery: string;
    searchResults: any[];
    isSearching: boolean;
    showResults: boolean;
    locationData: LocationData;
    setSearchQuery: (value: string | ((prevState: string) => string)) => void;
    selectLocation: (feature: any) => void;
    clearSearch: () => void;
    setLocationData: React.Dispatch<React.SetStateAction<LocationData>>;
    setShowResults: React.Dispatch<React.SetStateAction<boolean>>;
    resetLocationState: () => void;
}

export const useAddLocation = (
    initialLocation?: LocationData
): UseAddLocationReturn => {
    const [searchQuery, setSearchQueryState] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [locationData, setLocationData] = useState<LocationData>({
        title: initialLocation?.title || "",
        location_coordinates: initialLocation?.location_coordinates || undefined,
    });

    const isSelectingLocation = useRef(false);
    useEffect(() => {
        if (isSelectingLocation.current) {
            isSelectingLocation.current = false;
            return;
        }

        if (!searchQuery.trim()) {
            setSearchResults([]);
            setShowResults(false);
            setLocationData((prev) => ({
                ...prev,
                location_coordinates: undefined,
            }));
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                        searchQuery
                    )}.json?access_token=${mapboxgl.accessToken}&limit=5`
                );
                const data = await response.json();
                setSearchResults(data.features || []);
                setShowResults(true);
            } catch (error) {
                console.error("Error searching locations:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const setSearchQuery = (
        value: string | ((prevState: string) => string)
    ) => {
        const newValue =
            typeof value === "function" ? value(searchQuery) : value;
        setSearchQueryState(newValue);
        setLocationData((prev) => ({
            ...prev,
            title: newValue,
        }));
    };

    const selectLocation = (feature: any) => {

        isSelectingLocation.current = true;

        const userEnteredTitle = feature.text;
        const coordinates = feature.geometry?.coordinates || [];
        const locationCoordinates: LocationCoordinates = {
            lng: coordinates[0],
            lat: coordinates[1],
        };

        setLocationData((prev) => ({
            ...prev,
            title: userEnteredTitle,
            location_coordinates: locationCoordinates,
        }));

        setShowResults(false);
    };

    const clearSearch = () => {
        setSearchQueryState("");
        setSearchResults([]);
        setShowResults(false);
        setLocationData((prev) => ({
            ...prev,
            title: "",
            location_coordinates: undefined,
        }));
    };

    const resetLocationState = () => {
        setSearchQueryState("");
        setSearchResults([]);
        setShowResults(false);
        setLocationData({
            title: initialLocation?.title || "",
            location_coordinates: initialLocation?.location_coordinates || undefined,
        });
    };
    
    return {
        searchQuery,
        searchResults,
        isSearching,
        showResults,
        locationData,
        setSearchQuery,
        selectLocation,
        clearSearch,
        setLocationData,
        setShowResults,
        resetLocationState,
    };
};