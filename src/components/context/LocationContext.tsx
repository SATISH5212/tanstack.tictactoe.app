import { useUserDetails } from "@/lib/helpers/userpermission";
import { ExtendedLocationContextType, IUserLocation } from "@/lib/interfaces/maps/ponds";
import { getAllUsersForDeviceAPI } from "@/lib/services/deviceses";
import { getAdminUserLocationsAPI } from "@/lib/services/locations";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Location, UsersList } from "src/lib/interfaces/users";

const LocationContext = createContext<ExtendedLocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { pathname } = useLocation();
    const { isAdmin, getUserId } = useUserDetails();
    const isPondRoute = pathname.includes("/dashboard");
    const navigate = useNavigate();
    const userLoadMoreRef = useRef<HTMLDivElement>(null);

    const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<IUserLocation | null>(null);
    const [locationSearchString, setLocationSearchString] = useState("");
    const [debounceLocationSearchString, setDebounceLocationSearchString] = useState("");
    const [isLocationSelectOpen, setIsLocationSelectOpen] = useState(false);

    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<UsersList | null>(null);
    const [userSearchString, setUserSearchString] = useState("");
    const [debounceUserSearchString, setDebounceUserSearchString] = useState("");
    const [isUserSelectOpen, setIsUserSelectOpen] = useState(false);
    const [initialUserNavigationDone, setInitialUserNavigationDone] = useState(false);
    const pondsRoute = (pathname.includes("/ponds") || pathname.includes("/dashboard")) && (!pathname.includes("/users"));

    const { data: usersData, isLoading: isUsersLoading } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await getAllUsersForDeviceAPI({ get_all: true });
            return response.data.data;
        },
        enabled: pondsRoute && isAdmin(),
        retry: false,
        refetchOnWindowFocus: false,
    });

    const filteredUsers = useMemo(() => {
        if (!usersData || usersData.length === 0) return [];
        if (!userSearchString.trim()) return usersData;

        const searchLower = userSearchString.toLowerCase().trim();
        return usersData.filter((user: UsersList) => {
            const userFullName = user.full_name?.toLowerCase() || "";

            return userFullName.includes(searchLower)
        });
    }, [usersData, userSearchString]);

    const { data: locationsData, isLoading: isLocationsLoading } = useQuery({
        queryKey: ["locations", selectedUserId],
        queryFn: async () => {
            if (!selectedUserId && isAdmin()) return [];
            const userId = (isAdmin() ? selectedUserId : getUserId());
            const response = await getAdminUserLocationsAPI(userId);
            return response.data.data;
        },
        enabled: pondsRoute,
        retry: false,
        refetchOnWindowFocus: false,
    });

    const filteredLocations = useMemo(() => {
        if (!locationsData || locationsData.length === 0) return [];
        if (!locationSearchString.trim()) return locationsData;
        const searchLower = locationSearchString.toLowerCase().trim();
        return locationsData.filter((location: Location) => {
            const locationTitle = location.title?.toLowerCase() || "";

            return locationTitle.includes(searchLower)
        });
    }, [locationsData, locationSearchString]);

    useEffect(() => {
        if (initialUserNavigationDone || !filteredUsers || filteredUsers.length === 0) return;

        const searchParams = new URLSearchParams(window.location.search);
        const userIdParam = searchParams.get("user_id")

        if (userIdParam) {
            const userId = Number(userIdParam);
            const user = filteredUsers.find((u: UsersList) => u.id === userId);

            if (user) {
                setSelectedUserId(userId);
                setSelectedUser(user);
            } else {
                const firstUser = filteredUsers?.[0];
                setSelectedUserId(firstUser.id);
                setSelectedUser(firstUser);
                navigate({
                    to: pathname,
                    search: (prev: any) => ({ ...prev, user_id: firstUser.id }),
                    replace: true,
                });
            }
        } else {
            const firstUser = filteredUsers?.[0];
            setSelectedUserId(firstUser.id);
            setSelectedUser(firstUser);
            navigate({
                to: pathname,
                search: (prev: any) => ({ ...prev, user_id: firstUser.id }),
                replace: true,
            });
        }
        setInitialUserNavigationDone(true);
    }, [filteredUsers, isAdmin, initialUserNavigationDone, pathname, navigate]);
    useEffect(() => {
        if (!isPondRoute || !filteredLocations || filteredLocations.length === 0) return;
        const searchParams = new URLSearchParams(window.location.search);
        const pondLocationIdParam = searchParams.get("pond_location_id");
        const locationIdParam = searchParams.get("location_id");
        let targetLocationId: number | null = null;

        if (pondLocationIdParam) {
            targetLocationId = Number(pondLocationIdParam);
            const pond = searchParams.get("pond");
            const edit = searchParams.get("edit");
            const newSearch: any = { location_id: targetLocationId };
            if (pond) newSearch.pond = Number(pond);
            if (edit) newSearch.edit = edit === "true";

            navigate({
                to: pathname,
                search: newSearch,
                replace: true,
            });
        } else if (locationIdParam) {
            targetLocationId = Number(locationIdParam);
        }

        if (targetLocationId) {
            const location = filteredLocations.find((loc: Location) => loc.id === targetLocationId);
            if (location) {
                setSelectedLocationId(targetLocationId);
                setSelectedLocation(location);
            } else {

                const firstLocation = filteredLocations?.[0];
                setSelectedLocationId(firstLocation.id);
                setSelectedLocation(firstLocation);
                navigate({
                    to: pathname,
                    search: (prev: any) => ({ ...prev, location_id: firstLocation.id }),
                    replace: true,
                });
            }
        } else {
            const firstLocation = filteredLocations?.[0];
            setSelectedLocationId(firstLocation.id);
            setSelectedLocation(firstLocation);
            navigate({
                to: pathname,
                search: (prev: any) => ({ ...prev, location_id: firstLocation.id }),
                replace: true,
            });
        }


    }, [filteredLocations, isPondRoute, pathname, navigate]);


    useEffect(() => {
        if (selectedLocationId === null) {
            setSelectedLocation(null);
            return;
        }
        const location = filteredLocations?.find((loc: Location) => loc.id === selectedLocationId) || null;
        setSelectedLocation(location);
    }, [selectedLocationId, filteredLocations]);

    useEffect(() => {
        if (selectedUserId === null) {
            setSelectedUser(null);
            return;
        }
        const user = filteredUsers?.find((u: UsersList) => u.id === selectedUserId) || null;
        setSelectedUser(user);
    }, [selectedUserId, filteredUsers]);

    const handleLocationChange = (value: string) => {
        const locationId = Number(value) || null;
        setSelectedLocationId(locationId);

        navigate({
            to: pathname,
            search: (prev: any) => {
                const newSearch = { ...prev };
                delete newSearch.pond;
                delete newSearch.pond_location_id;
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
                delete newSearch.pond;
                delete newSearch.pond_location_id;
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
                delete newSearch.pond;
                delete newSearch.pond_location_id;
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

    return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocationContext = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error("useLocationContext must be used within a LocationProvider");
    }
    return context;
};