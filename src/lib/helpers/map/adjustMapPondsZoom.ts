import mapboxgl from "mapbox-gl";
import { Pond, PondCoordinate } from "@/lib/interfaces/maps/ponds";

export const adjustPondZoom = (
    map: React.MutableRefObject<mapboxgl.Map | null>,
    isMapLoaded: boolean,
    pondIndex: number | null,
    mapPonds: Pond[],
    isPondsTablePage: boolean
): void => {
    if (!map.current || !isMapLoaded || pondIndex === null) return;
    const pond = mapPonds[pondIndex];
    if (!pond?.pond_coordinates || pond.pond_coordinates.length === 0) return;

    try {
        const bounds = new mapboxgl.LngLatBounds();
        pond.pond_coordinates.forEach((coord: PondCoordinate) => {
            bounds.extend([coord.lng, coord.lat]);
        });
        const padding = isPondsTablePage
            ? {
                top: window.innerHeight * 0.1,
                bottom: window.innerHeight * 0.1,
                left: window.innerWidth * 0.1,
                right: window.innerWidth * 0.1
            }
            : {
                top: window.innerHeight * 0.1,
                bottom: window.innerHeight * 0.1,
                left: 10 + (window.innerWidth - 10) * 0.1,
                right: (window.innerWidth - 10) * 0.09
            };

        map.current.fitBounds(bounds, {
            padding: padding,
            duration: 1000,
            maxZoom: 18
        });
    } catch (error) {
        console.error("Error fitting pond to bounds:", error);
    }
};

export const adjustPondZoomWithResize = (
    map: React.MutableRefObject<mapboxgl.Map | null>,
    isMapLoaded: boolean,
    pondIndex: number | null,
    mapPonds: Pond[],
    isPondsTablePage: boolean
): void => {
    if (!map.current || !isMapLoaded || pondIndex === null) return;
    map.current.resize();

    requestAnimationFrame(() => {
        setTimeout(() => {
            adjustPondZoom(map, isMapLoaded, pondIndex, mapPonds, isPondsTablePage);
        }, 350);
    });
};

export const resetMapToInitialZoom = (
    map: React.MutableRefObject<mapboxgl.Map | null>,
    isMapLoaded: boolean,
): void => {
    if (!map.current || !isMapLoaded) return;
    try {
        map.current.flyTo({
            zoom: 15,
            duration: 1000
        });
    } catch (error) {
        console.error("Error resetting map view:", error);
    }
}