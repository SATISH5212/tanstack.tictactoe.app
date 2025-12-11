import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

export interface MapboxFeature {
  center: [number, number];
  place_name: string;
  text: string;
}

export function useMapboxSearch(map: React.MutableRefObject<mapboxgl.Map | null>) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<MapboxFeature[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const searchMarker = useRef<mapboxgl.Marker | null>(null);
  const skipSearchRef = useRef<boolean>(false);

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const center = map.current?.getCenter();
      const proximityParam = center
        ? `&proximity=${center.lng},${center.lat}`
        : "";

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${mapboxgl.accessToken}&limit=5${proximityParam}`
      );
      const data = await response.json();
      setSearchResults(data.features || []);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }

    const debounceTimer = setTimeout(() => {
      if (searchQuery) searchLocation(searchQuery);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const lastSelectedFeatureRef = useRef<MapboxFeature | null>(null);

  const selectLocation = (feature: MapboxFeature) => {
    lastSelectedFeatureRef.current = feature;
    const [lng, lat] = feature.center;

    if (searchMarker.current) {
      searchMarker.current.remove();
    }

    if (map.current) {
      searchMarker.current = new mapboxgl.Marker({ color: "blue" })
        .setLngLat([lng, lat])
        .addTo(map.current);

      map.current.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 2000,
      });
    }

    setShowResults(false);
    skipSearchRef.current = true;
    setSearchQuery(feature.place_name);
  };


  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    if (searchMarker.current) {
      searchMarker.current.remove();
      searchMarker.current = null;
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showResults,
    selectLocation,
    clearSearch,
    lastSelectedFeatureRef,
  };
}