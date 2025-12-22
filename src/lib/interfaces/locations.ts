import { Dispatch, SetStateAction } from "react";
import { UsersList } from "./users";

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


export interface ExtendedLocationContextType extends LocationContextType {
  users: UsersList[];
  selectedUser: UsersList | null;
  selectedUserId: number | null;
  userSearchString: string;
  debounceUserSearchString: string;
  setUserSearchString: (value: string) => void;
  isUsersLoading: boolean;
  // isUsersError: boolean;
  // isFetchingNextUserPage: boolean;
  // hasNextUserPage: boolean;
  // fetchNextUserPage: () => void;
  userLoadMoreRef: React.RefObject<HTMLDivElement | null>;
  isUserSelectOpen: boolean;
  setIsUserSelectOpen: (value: boolean) => void;
  setSelectedUserId: (id: number | null) => void;
  setSelectedUser: (user: UsersList | null) => void;
  handleUserChange: (value: string) => void;
  handleClearUser: () => void;
}



