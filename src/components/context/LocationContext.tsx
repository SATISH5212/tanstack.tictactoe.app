import { IUserLocation } from "@/lib/interfaces/locations/userLocations";
import { ExtendedLocationContextType } from "@/lib/interfaces/users/usersList";
import { getAllUsersForDeviceAPI } from "@/lib/services/devices";
import { getAdminUserLocationsAPI } from "@/lib/services/locations";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Location, UsersList } from "src/lib/interfaces/users";

const LocationContext = createContext<ExtendedLocationContextType | undefined>(
  undefined
);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { pathname } = useLocation();
//   const { isAdmin, getUserId } = useUserDetails();
  const navigate = useNavigate();
  const userLoadMoreRef = useRef<HTMLDivElement>(null);
  

  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    null
  );
  const [selectedLocation, setSelectedLocation] =
    useState<IUserLocation | null>(null);
  const [locationSearchString, setLocationSearchString] = useState("");
  const [debounceLocationSearchString, setDebounceLocationSearchString] =
    useState("");
  const [isLocationSelectOpen, setIsLocationSelectOpen] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<UsersList | null>(null);
  const [userSearchString, setUserSearchString] = useState("");
  const [debounceUserSearchString, setDebounceUserSearchString] = useState("");
  const [isUserSelectOpen, setIsUserSelectOpen] = useState(false);
 
 const pondsRoute = pathname.includes("/devices");

  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await getAllUsersForDeviceAPI({ get_all: true });
      return response?.data?.data;
    },
    enabled: pondsRoute,
    retry: false,
    refetchOnWindowFocus: false,
  });

  
  const filteredUsers = useMemo(() => {
    if (!usersData || usersData.length === 0) return [];
    if (!userSearchString.trim()) return usersData;

    const searchLower = userSearchString.toLowerCase().trim();
    return usersData.filter((user: UsersList) => {
      const userFullName = user.full_name?.toLowerCase() || "";

      return userFullName.includes(searchLower);
    });
  }, [usersData, userSearchString]);

  const { data: locationsData, isLoading: isLocationsLoading } = useQuery({
    queryKey: ["locations", selectedUserId],
    queryFn: async () => {
    const queryParams = {
        user_id : selectedUserId
    }
      const response = await getAdminUserLocationsAPI(queryParams);
      return response.data.data;
    },
    enabled: !!selectedUserId,
    retry: false,
    refetchOnWindowFocus: false,
  });


  const filteredLocations = useMemo(() => {
    if (!locationsData || locationsData.length === 0) return [];
    if (!locationSearchString.trim()) return locationsData;
    const searchLower = locationSearchString.toLowerCase().trim();
    return locationsData.filter((location: Location) => {
      const locationTitle = location.title?.toLowerCase() || "";

      return locationTitle.includes(searchLower);
    });
  }, [locationsData, locationSearchString]);

  useEffect(() => {
    if (selectedLocationId === null) {
      setSelectedLocation(null);
      return;
    }
    const location =
      filteredLocations?.find(
        (loc: Location) => loc.id === selectedLocationId
      ) || null;
    setSelectedLocation(location);
  }, [selectedLocationId, filteredLocations]);

  useEffect(() => {
    if (selectedUserId === null) {
      setSelectedUser(null);
      return;
    }
    const user =
      filteredUsers?.find((u: UsersList) => u.id === selectedUserId) || null;
    setSelectedUser(user);
  }, [selectedUserId, filteredUsers]);

  


  const handleLocationChange = (value: string) => {
    const locationId = Number(value) || null;
    setSelectedLocationId(locationId);

    navigate({
      to: pathname,
      search: (prev: any) => {
        const newSearch = { ...prev };
        if (locationId) {
          newSearch.location_id = locationId;
        } else {
          delete newSearch.location_id;
        }
        return newSearch;
      },
      replace: true,
    });
  };


  const handleClearLocation = () => {
    setSelectedLocation(null);
    setSelectedLocationId(null);
    navigate({
      to: pathname,
      search: (prev: any) => {
        const newSearch = { ...prev };
        delete newSearch.location_id;
        return newSearch;
      },
      replace: true,
    });
  };

  const handleUserChange = (value: string) => {
    const userId = Number(value) || null;
    setSelectedUserId(userId);
    setSelectedLocationId(null);
    setSelectedLocation(null);

    navigate({
      to: pathname,
      search: (prev: any) => {
        const newSearch = { ...prev };
        if (userId) {
          newSearch.user_id = userId;
        } else {
          delete newSearch.user_id;
        }
        delete newSearch.location_id;
        return newSearch;
      },
      replace: true,
    });
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    setSelectedUserId(null);
    setSelectedLocation(null);
    setSelectedLocationId(null);

    navigate({
      to: pathname,
      search: (prev: any) => {
        const newSearch = { ...prev };
        delete newSearch.user_id;
        delete newSearch.location_id;
        return newSearch;
      },
      replace: true,
    });
  };

  const value: ExtendedLocationContextType = {
    locations: filteredLocations || [],
    selectedLocation,
    selectedLocationId,
    locationSearchString,
    debounceLocationSearchString,
    setLocationSearchString,
    isLocationsLoading,
    isLocationSelectOpen,
    setIsLocationSelectOpen,
    setSelectedLocationId,
    setSelectedLocation,
    handleLocationChange,
    handleClearLocation,
    users: filteredUsers || [],
    selectedUser,
    selectedUserId,
    userSearchString,
    debounceUserSearchString,
    setUserSearchString,
    isUsersLoading,
    userLoadMoreRef,
    isUserSelectOpen,
    setIsUserSelectOpen,
    setSelectedUserId,
    setSelectedUser,
    handleUserChange,
    handleClearUser,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error(
      "useLocationContext must be used within a LocationProvider"
    );
  }
  return context;
};
