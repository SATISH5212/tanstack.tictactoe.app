import LocationDropdown from "@/components/core/LocationDropdown";
import MapSearchBox from "@/components/dashboard/MapSearchBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAddLocation } from "@/lib/helpers/map/addLocationHelper";
import { useUserDetails } from "@/lib/helpers/userpermission";
import {
  AddGatewayProps,
  GatewayPayload,
  LocationPayload,
} from "@/lib/interfaces";
import {
  addUserGatewayAPI,
  addUserLocationAPI,
  getAllUserLocations,
  updateUserGatewayAPI,
} from "@/lib/services";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { CircleCheck, CircleX, Loader2, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

const AddGatewayComponent = ({
  gateway,
  isEditMode = false,
  user_id,
  location_id,
  refetch,
}: AddGatewayProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const locationLoadMoreRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isAddingLocation, setIsAddingLocation] = React.useState(false);
  const [locationError, setLocationError] = React.useState<string | null>(null);
  const [gatewayData, setGatewayData] = React.useState<GatewayPayload>({
    title: gateway?.title || "",
    location_id: location_id || gateway?.location_id,
    user_id: Number(user_id),
    id: gateway?.id,
  });
  const { pathname, search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const [searchString, setSearchString] = React.useState<string>(
    searchParams.get("search_string") || ""
  );
  const [debounceSearchString, setDebounceSearchString] =
    React.useState<string>(searchParams.get("search_string") || "");
  const [errors, setErrors] = React.useState<
    Partial<GatewayPayload & { api: string }>
  >({});
  const [selectedLocation, setSelectedLocation] = React.useState<any>(null);
  const [isSelectOpen, setIsSelectOpen] = React.useState(false);
  const { isOwner } = useUserDetails();

  const {
    searchQuery,
    searchResults,
    isSearching,
    showResults,
    locationData,
    setSearchQuery,
    selectLocation: selectMapboxLocation,
    clearSearch,
    setShowResults,
    resetLocationState,
  } = useAddLocation();
  const gatewayMutation = useMutation({
    mutationFn: isEditMode
      ? (payload: GatewayPayload) =>
        updateUserGatewayAPI(payload.id || 0, payload)
      : (payload: GatewayPayload) => addUserGatewayAPI(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["gateways"] });
      queryClient.invalidateQueries({ queryKey: ["userLocations"], });
      setIsOpen(false);
      setGatewayData({
        title: "",
        location_id: location_id,
        user_id: Number(user_id),
        id: undefined,
      });
      setErrors({});
      toast.success(isEditMode ? "Gateway updated successfully" : "Gateway added successfully");
      refetch();
      navigate({
        to: `/locations/${gatewayData?.location_id}/gateways`,
        search: searchParams.toString(),
      })
    },
    onError: (error: any) => {
      console.error("Gateway mutation error:", error);
      if (error?.status === 422) {
        const errorMessages = error?.data?.errors || error?.data?.message;
        setErrors(errorMessages);
      } else if (
        error?.status === 409 ||
        error?.status === 401 ||
        error?.status === 400 ||
        error?.status === 404
      ) {
        toast.error(
          error?.data?.message || "An error occurred. Please try again."
        );
      }
    },
  });

  const locationMutation = useMutation({
    mutationFn: (payload: LocationPayload) => addUserLocationAPI(payload),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["userLocations"] });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      queryClient.invalidateQueries({ queryKey: ["userBasedLocations"] });
      const newLocationId = data?.data?.data?.id;
      const newLocation = data?.data?.data;
      setGatewayData((prev) => ({
        ...prev,
        location_id: newLocationId,
      }));
      setSelectedLocation(newLocation);

      resetLocationState();
      setLocationError(null);
      setIsAddingLocation(false);
      toast.success("Location added successfully");
      refetch();
    },
    onError: (error: any) => {
      if (error?.status === 422) {
        const errorMessages = error?.data?.errors || error?.data?.message;
        if (typeof errorMessages === "object") {
          const firstError =
            errorMessages.title ||
            errorMessages.location_coordinates ||
            Object.values(errorMessages)[0];
          setLocationError(firstError as string);
        } else {
          setLocationError(errorMessages);
        }
      } else {
        setLocationError(error?.data?.message || "Failed to add location");
      }
    },
    retry: false,
  });

  const {
    data: locationsData,
    isLoading: isLocationsLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isError: isLocationsError,
  } = useInfiniteQuery({
    queryKey: ["userBasedLocations", user_id, debounceSearchString],
    queryFn: async ({ pageParam = 1 }) => {
      const queryParams = {
        page: pageParam,
        limit: 10,
        ...(debounceSearchString && { search_string: debounceSearchString }),
      };
      const response = await getAllUserLocations(queryParams);
      return response.data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination) return undefined;
      const { current_page, total_pages } = lastPage.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const getAllLocations = React.useMemo(() => {
    return locationsData?.pages?.flatMap((page) => page.data) || [];
  }, [locationsData]);

  React.useEffect(() => {
    setGatewayData((prev) => ({
      ...prev,
      location_id: location_id || prev.location_id,
    }));
  }, [location_id]);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (searchString !== debounceSearchString) {
        setDebounceSearchString(searchString);
        const currentSearchParams = new URLSearchParams(search);
        if (searchString) {
          currentSearchParams.set("search_string", searchString);
        } else {
          currentSearchParams.delete("search_string");
        }
        navigate({
          to: pathname,
          search: (prev: any) => ({
            ...prev,
            search_string: searchString || undefined,
          }),
          replace: true,
        });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchString, debounceSearchString, pathname, search, navigate]);

  React.useEffect(() => {
    if (!isSelectOpen || !locationLoadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !isLocationsLoading
        ) {
          fetchNextPage();
        }
      },
      {
        threshold: 1.0,
        rootMargin: "10px",
      }
    );
    const currentRef = locationLoadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isSelectOpen,
    isLocationsLoading,
  ]);

  React.useEffect(() => {
    if (gatewayData.location_id && getAllLocations.length > 0) {
      const location = getAllLocations.find(
        (loc) => loc.id === gatewayData.location_id
      );
      setSelectedLocation(location || null);
    }
  }, [gatewayData.location_id, getAllLocations]);

  const handleDrawerClose = () => {
    setIsOpen(false);
    setGatewayData({
      title: "",
      location_id: location_id,
      user_id: Number(user_id),
      id: undefined,
    });
    setErrors({});
    resetLocationState();
    setLocationError(null);
    setIsAddingLocation(false);
    setSelectedLocation(null);
    setIsSelectOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGatewayData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev: any) => ({ ...prev, [name]: null, api: null }));
  };

  const handleLocationSelect = (locationId: string) => {
    const location = getAllLocations.find(
      (loc) => loc.id === parseInt(locationId)
    );
    setGatewayData((prev) => ({
      ...prev,
      location_id: parseInt(locationId),
    }));
    setSelectedLocation(location || null);
    setErrors((prev: any) => ({ ...prev, location_id: null, api: null }));
  };

  const handleSearchQueryChange = (
    value: string | ((prevState: string) => string)
  ) => {
    setSearchQuery(value);
    setLocationError(null);
  };

  const handleSelectMapboxLocation = (feature: any) => {
    setSearchQuery(feature?.text);
    selectMapboxLocation(feature);
    setLocationError(null);
  };

  const handleAddNewLocation = () => {
    if (!locationData.title) {
      return setLocationError("Location is required");
    }
    if (!locationData.location_coordinates) {
      setLocationError("Please select a location from the search results");
      return;
    }

    if (!locationData.title.trim()) {
      setLocationError("Location title is required");
      return;
    }

    locationMutation.mutate({
      title: locationData.title,
      location_coordinates: locationData.location_coordinates,
    });
  };

  const handleCancelAddLocation = () => {
    resetLocationState();
    setLocationError(null);
    setIsAddingLocation(false);
  };

  const handleSubmit = () => {
    const payload: GatewayPayload = {
      title: gatewayData.title,
      user_id: Number(user_id),
      id: gatewayData.id,
    };
    if (gatewayData.location_id) {
      payload.location_id = Number(gatewayData.location_id);
    }
    gatewayMutation.mutate(payload);
  };

  return (
    <div>
      {isOwner() && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-6 px-2 bg-green-500 hover:bg-green-600 rounded flex items-center gap-1 text-white text-xs 3xl:text-sm font-normal disabled:cursor-not-allowed disabled:opacity-50"
          disabled={gatewayMutation.isPending}
        >
          {isEditMode ? "Edit Gateway" : "+ Add Gateway"}
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-custom_25per sm:max-w-custom_20per min-w-custom_20per max-w-custom_20per px-4 py-4 m-2 font-inter  animate-fade-in">
            <div className="flex items-center justify-between pt-1 pb-2 border-b">
              <h2 className="font-inter text-black/80 font-normal text-sm 3xl:text-lg">
                {isEditMode ? "Edit Gateway" : "Add Gateway"}
              </h2>
              <Button
                variant="outline"
                onClick={handleDrawerClose}
                className="h-6 w-6 rounded-full  hover:bg-red-200 text-red-500 hover:text-red-600 p-1 "
              >
                <X />
              </Button>
            </div>

            <div className="grid gap-5 mt-2 max-h-[65vh] ">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm 3xl:text-base font-normal">
                  Select Location <span className="text-red-500">*</span>
                </Label>

                <LocationDropdown
                  pond={{ location: gatewayData.location_id }}
                  locations={getAllLocations}
                  isLocationsLoading={isLocationsLoading}
                  searchString={searchString}
                  setSearchString={setSearchString}
                  setIsSelectOpen={setIsSelectOpen}
                  handlePondLocationChange={handleLocationSelect}
                  handleClearLocation={() => {
                    setGatewayData((prev) => ({ ...prev, location_id: null }));
                    setSelectedLocation(null);
                  }}
                  selectedLocation={selectedLocation}
                />

                {!isAddingLocation ? (
                  <Button
                    onClick={() => setIsAddingLocation(true)}
                    className="text-green-600 mt-2 border-none w-fit hover:bg-green-200 bg-green-100 !h-6 px-3 text-xs 3xl:text-sm font-light rounded-md"
                    disabled={isAddingLocation}
                  >
                    + Add New
                  </Button>
                ) : (
                  <>
                    <div className="flex items-center gap-4  py-1   rounded-md">
                      <div className="relative overflow-visible">
                        <MapSearchBox
                          searchQuery={searchQuery}
                          setSearchQuery={handleSearchQueryChange}
                          searchResults={searchResults}
                          isSearching={isSearching}
                          showResults={showResults}
                          selectLocation={handleSelectMapboxLocation}
                          clearSearch={clearSearch}
                          isAddingLocation={true}
                          setShowResults={setShowResults}
                        />
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <Button
                          onClick={handleAddNewLocation}
                          disabled={locationMutation.isPending}
                          className="p-0 bg-transparent hover:bg-transparent"
                        >
                          {locationMutation.isPending ? (
                            <Loader2 className="animate-spin size-4 text-green-600" />
                          ) : (
                            <CircleCheck className="size-4 text-green-600" />
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={handleCancelAddLocation}
                          className="p-0 bg-transparent hover:bg-transparent"
                        >
                          <CircleX className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    {locationError && (
                      <span className="text-red-500 text-xs -mt-2">
                        {locationError}
                      </span>
                    )}
                    {errors?.location_id && (
                      <span className="text-red-500 text-xs -mt-2">
                        {errors.location_id}
                      </span>
                    )}
                    {searchQuery.length > 0 &&
                      locationData.location_coordinates && (
                        <div className="text-xs -mt-2">
                          <span className="text-green-600">Latitude:</span>{" "}
                          {locationData.location_coordinates.lat.toFixed(6)}{" "}
                          <span className="text-green-600 ml-2">
                            Longitude:
                          </span>{" "}
                          {locationData.location_coordinates.lng.toFixed(6)}
                        </div>
                      )}

                  </>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm font-normal">
                  Gateway Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  className="border-gray-200 shadow-none rounded-md focus-visible:ring-0 text-sm 3xl:text-md placeholder:text-xs"
                  placeholder="Enter Gateway Name"
                  id="title"
                  name="title"
                  value={gatewayData.title}
                  onChange={handleChange}
                  maxLength={30}
                />
                {errors?.title && (
                  <span className="text-red-500 text-xs">{errors.title}</span>
                )}
              </div>

              {errors?.api && (
                <span className="text-red-500 text-xs">{errors.api}</span>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4  pt-3">
              <Button
                variant="outline"
                onClick={handleDrawerClose}
                className="h-8 px-2 text-sm border border-gray-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={gatewayMutation.isPending}
                className="h-8 px-5 text-sm bg-green-500 hover:bg-green-600 text-white"
              >
                {gatewayMutation.isPending ? (
                  <Loader2 className="animate-spin size-4" />
                ) : isEditMode ? (
                  "Update"
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddGatewayComponent;
