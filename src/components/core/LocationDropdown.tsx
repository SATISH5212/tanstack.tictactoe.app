import { LocationDropdownProps } from "@/lib/interfaces/users";
import { Check, Loader2, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import LocationIcon from "../icons/users/location";
import DownArrowIcon from "../svg/DownArrow";
import { useEffect, useRef, useState } from "react";

const LocationDropdown: React.FC<any> = (props) => {
  const {
    pond,
    locations,
    isLocationsLoading,
    searchString,
    setSearchString,
    setIsSelectOpen,
    handlePondLocationChange,
    selectedLocation,
    handleClearLocation,
    ispondsRoute,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [searchString]);

  return (
    <Select
      value={pond?.location ? pond.location.toString() : ""}
      onValueChange={handlePondLocationChange}
      // onOpenChange={(open) => {
      //   setIsSelectOpen(open);

      //   if (!open) {
      //     setSearchString("");
      //   }
      // }}
    >
      <SelectTrigger
        className={`${ispondsRoute && "!border-0 !border-b-2 "}  bg-white w-full border rounded-lg text-sm py-1.5 focus:outline-none focus:ring-2 gap-1 h-full`}
      >
        <div className="flex items-center capitalize text-xs gap-2 ">
          <LocationIcon /> 
          <SelectValue placeholder="Select Location">
            {selectedLocation ? selectedLocation.title : "Select Location"}
          </SelectValue>
        </div>

        {!ispondsRoute && selectedLocation ? (
          <X
            className="w-3 h-3 cursor-pointer"
            onPointerDown={(e) => {
              e.preventDefault();
              handleClearLocation();
            }}
          />
        ) : (
          <DownArrowIcon className="w-4 h-4" />
        )}
      </SelectTrigger>

      <SelectContent className="bg-white p-1  ">
        <div className=" bg-white  z-60">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search location..."
            value={searchString}
            onChange={(e) => {
              setSearchString(e.target.value);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            onBlur={(e) => {
              e.preventDefault();
              setTimeout(() => {
                inputRef.current?.focus();
              }, 0);
            }}
            className="w-full border text-xs rounded-lg px-3 py-2 focus:outline-none  "
            autoFocus
          />
        </div>
        {isLocationsLoading && locations?.length === 0 ? (
          <div className="flex items-center justify-center px-4 py-2">
            <Loader2 className="animate-spin size-4 mr-2" />
            <span className="text-gray-400 text-xs">Loading locations...</span>
          </div>
        ) : locations?.length > 0 ? (
          <div className="max-h-60 overflow-y-auto">
            {locations?.map((location: any, index: number) => (
              <SelectItem
                key={`${location.id}-${index}`}
                value={location.id.toString()}
              >
                <div className="flex justify-between items-center w-full cursor-pointer capitalize">
                  <span
                    className={`${pond?.location?.toString() === location.id.toString() ? "font-medium text-[#059669]" : ""}`}
                  >
                    {location.title}
                  </span>
                  {pond?.location?.toString() === location.id.toString() && (
                    <Check className="w-4 h-4 text-[#059669] ml-4" />
                  )}
                </div>
              </SelectItem>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 px-4 py-2 text-xs">
            No data available
          </div>
        )}
      </SelectContent>
    </Select>
  );
};

export default LocationDropdown;
