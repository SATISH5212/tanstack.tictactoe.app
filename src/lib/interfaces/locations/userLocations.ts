import { Dispatch, SetStateAction } from "react";

export interface IUserLocation {
  id: number;
  title: string;
}

export interface LocationContextType {

  locations: IUserLocation[];
  selectedLocation: IUserLocation | null;
  selectedLocationId: number | null;

  locationSearchString: string;
  debounceLocationSearchString: string;
  setLocationSearchString: (value: string) => void;

  isLocationsLoading: boolean;
  // isLocationsError: boolean;
  // isFetchingNextLocationPage: boolean;

  // hasNextLocationPage: boolean;
  // fetchNextLocationPage: () => void;
  // locationLoadMoreRef: React.RefObject<HTMLDivElement | null>;

  isLocationSelectOpen: boolean;
  setIsLocationSelectOpen: (value: boolean) => void;
  setSelectedLocationId: (id: number | null) => void;
  setSelectedLocation: Dispatch<SetStateAction<IUserLocation | null>>;
  handleLocationChange: (value: string) => void;
  handleClearLocation: () => void;
}