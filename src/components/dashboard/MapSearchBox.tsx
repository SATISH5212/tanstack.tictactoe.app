import { IMapSarchBox } from "@/lib/interfaces/maps";
import { useLocation } from "@tanstack/react-router";
import { FC, useRef, useEffect } from "react";
import SearchMagnifierIcon from "../svg/SearchMagnifierIcon";

const MapSearchBox: FC<IMapSarchBox> = (props) => {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showResults,
    selectLocation,
    clearSearch,
    isAddingLocation,
    lastSelectedFeatureRef,
    setErrors,
    isMapPage,
  } = props;

  const pathname = useLocation().pathname;
  const isPathActive = pathname.includes("/dashboard");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const searchBoxRef = useRef<HTMLDivElement>(null);

  const handleLocationFlyBack = () => {
    const matched = searchResults.find((f) => f.place_name === searchQuery);

    if (matched) {
      selectLocation(matched);
      return;
    }
    if (lastSelectedFeatureRef?.current) {
      selectLocation(lastSelectedFeatureRef.current);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        if (showResults && props.setShowResults) {
          props.setShowResults(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showResults, props]);

  return (
    <div className={`${isMapPage ? "absolute top-1 left-[750px] z-20" : "relative w-full"}`} ref={searchBoxRef}>
      <div className="flex items-center w-70  h-8 rounded-lg">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (setErrors) {
              setErrors((prev: any) => ({
                ...prev,
                location_coordinates: null,
                api: null,
              }));
            }
          }}
          placeholder={isAddingLocation ? "Enter Location Name" : "Search..."}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLocationFlyBack();
            }
          }}
          className={`w-full px-4 h-full py-4 pr-20  text-sm capitalize
              ${isPathActive
              ? "rounded-l-lg focus:outline-none focus:border-transparent"
              : "rounded-lg border border-gray-200 outline-none"
            }`}
        />

        <div className="absolute right-9 flex items-center h-full">
          {!isAddingLocation && isSearching && (
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          )}

          {!isAddingLocation && searchQuery && !isSearching && (
            <button onClick={clearSearch} className="p-1">
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          )}
        </div>

        {!isAddingLocation && (
          <span
            className="h-full bg-green-500 rounded-r-lg flex items-center"
            onClick={handleLocationFlyBack}
          >
            <SearchMagnifierIcon className="bg-green-500 mx-1 rounded-r-lg p-1" />
          </span>
        )}
      </div>

      {showResults && searchQuery && searchResults.length > 0 && (
        <div
          ref={dropdownRef}
          className={`absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-[99999] ${pathname.includes("/locations") && "h-40"} overflow-y-scroll`}
        >
          {searchResults.map((feature, index) => (
            <button
              key={index}
              onClick={() => {
                setSearchQuery(feature?.text);
                selectLocation(feature);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50"
            >
              <div className="font-xs text-gray-900 truncate">
                {feature.text}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {feature.place_name}
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults &&
        searchResults.length === 0 &&
        searchQuery &&
        !isSearching && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50">
            <div className="text-gray-500 text-center text-sm">
              No results found for "{searchQuery}"
            </div>
          </div>
        )}
    </div>
  );
};

export default MapSearchBox;
