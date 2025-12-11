import React, { useState, useMemo, useRef } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "src/components/ui/dialog";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { RadioGroup, RadioGroupItem } from "src/components/ui/radio-group";
import { Label } from "src/components/ui/label";
import { capitalize } from "src/lib/helpers/capitalize";
import { getViewProfileDetails, userbasedLocationsAPI } from "@/lib/services";
import { Loader2 } from "lucide-react";

interface AssignLocationToUserProps {
  open: boolean;
   onClose: () => void;
  getData: () => void;
  user_id: number;
  assignLocation: (locationId: number) => void;
  isPending: boolean
  userLocations:any
}

interface LocationProps {
  id: any;
  title: any;
}

const AssignLocationToUser: React.FC<AssignLocationToUserProps> = ({
  open,
   onClose,
  getData,
  user_id,
  assignLocation,
  isPending,
  userLocations,
}) => {
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] =
    useState<LocationProps | null>(null);
  const locationListRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["locations", search, user_id],
      queryFn: async ({ pageParam = 1 }) => {
        const queryParams: any = {
          page: pageParam,
          page_size: 20,
          search_string: search,
        };
        const response = await userbasedLocationsAPI(queryParams);
               return response?.data?.data || { records: [], pagination_info: {} };
      },
      getNextPageParam: (lastPage) => {
        if (!lastPage?.pagination_info) return undefined;
        const { current_page, total_pages } = lastPage.pagination_info;
        return current_page < total_pages ? current_page + 1 : undefined;
      },
      initialPageParam: 1,
      enabled: open,
    });

  const locationsData = useMemo(() => {
    const allLocations: LocationProps[] = [];
    const locationMap = new Map<number, LocationProps>();

    data?.pages.forEach((page) => {
      page.records?.forEach((record: any) => {
        const location = { id: record.id, title: record.title };
        if (!locationMap.has(location.id)) {
          locationMap.set(location.id, location);
        }
      });
    });

    return Array.from(locationMap.values());
  }, [data]);


  const filteredLocations = useMemo(() => {
    if (!search.trim()) return locationsData;

    return locationsData.filter((location) =>
      location.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [locationsData, search]);

  const handleScroll = (e: React.SyntheticEvent) => {
    const container = e.currentTarget as HTMLDivElement;
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 10
    ) {
      fetchNextPage();
    }
  };

  const handleClose = () => {
    onClose();
    setSearch("");
    setSelectedLocation(null);
    queryClient.removeQueries({ queryKey: ["locations"] });
  };

  const handleConfirm = async () => {
    if (selectedLocation?.id && user_id) {
      assignLocation(selectedLocation.id);
      getData();
      // handleClose();

    } else {
      toast.error("Please select a location");
    }
  };
   const assignedLocationIds = useMemo(() => {
     return new Set(userLocations.map((loc: any) => loc.id));
   }, [userLocations]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xs rounded-lg bg-white p-4 [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between border-0 p-0">
          <DialogTitle className="text-sm 3xl:text-lg font-normal text-black sm:text-lg">
            Select Location
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
           className="h-6 w-6 rounded-full  hover:bg-red-200 text-red-500 hover:text-red-600 p-1 "
            onClick={handleClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </DialogHeader>
        <div className="mt-2">
          <Input
            type="search"
            placeholder="Search locations"
            value={search}
            onChange={(e: any) => setSearch(e?.target?.value)}
            className="h-8 rounded border border-gray-300 bg-white text-sm text-gray-500 focus:border-primary focus:ring-0"
          />
          <div
            ref={locationListRef}
            onScroll={handleScroll}
            className="h-60 overflow-y-auto mt-2"
          >
            <RadioGroup
              value={selectedLocation?.id?.toString() || ""}
              onValueChange={(value: string) => {
                const location = filteredLocations?.find(
                  (l: LocationProps) => l?.id.toString() === value
                );
                setSelectedLocation(location || null);
              }}
            >
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 mt-20">
                    Loading locations...
                  </span>
                </div>
              ) : filteredLocations.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">No locations found.</span>
                </div>
              ) : (
                <>
                  {filteredLocations?.map((location: LocationProps) => {
                    const isAssigned = assignedLocationIds.has(location.id);

                    return (
                      <div
                        key={location?.id}
                        className={`flex items-center space-x-2 rounded p-1 ${
                          isAssigned
                            ? "opacity-50 cursor-not-allowed bg-gray-50"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <RadioGroupItem
                          value={location?.id.toString()}
                          id={location?.id.toString()}
                          disabled={isAssigned}
                          className="text-gray-300 data-[state=checked]:text-primary disabled:cursor-not-allowed"
                        />
                        <Label
                          htmlFor={location?.id.toString()}
                          title={isAssigned && location?.title}
                          className={`flex-1 truncate text-smd 3xl:text-base font-normal text-black ${
                            isAssigned ? "cursor-not-allowed" : "cursor-pointer"
                          }`}
                        >
                          {location?.title &&
                          typeof location.title === "string" ? (
                            location.title.length > 20 ? (
                              <span title={location.title}>
                                {capitalize(
                                  location.title.slice(0, 20) + "..."
                                )}
                              </span>
                            ) : (
                              <>{capitalize(location.title)}</>
                            )
                          ) : (
                            "Untitled Location"
                          )}
                        </Label>
                      </div>
                    );
                  })}
                  {isFetchingNextPage && (
                    <div className="flex justify-center py-2">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                    </div>
                  )}
                </>
              )}
            </RadioGroup>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Button
            disabled={!selectedLocation?.id}
            onClick={handleConfirm}
            className="bg-primary text-xs 3xl:text-sm font-medium text-white hover:bg-primary/90 h-auto py-1.5 w-20"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Confirm"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignLocationToUser;
