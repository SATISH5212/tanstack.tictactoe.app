import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserDetails } from "@/lib/helpers/userpermission";
import { Location } from "@/lib/interfaces/maps/ponds";
import {
  deleteLocationAPI,
  getAllUserLocations,
} from "@/lib/services";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import DeleteDialog from "../core/DeleteDialog";
import SearchFilter from "../core/SearchFilter";
import { LocationSvg } from "../svg/location";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import LocationDialog from "./AddLocation";
import LocationListSkeleton from "./AddLocation/LocationListSkeleton";

export interface GetAllUserLocationsProps {
  onLocationsUpdate: (locations: Location[]) => void;
  userId: string | null;
}

const GetAllUserLocations = ({
  onLocationsUpdate,
  userId,
}: GetAllUserLocationsProps) => {
  const locationLoadMoreRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const queryClient = useQueryClient();
  const isLocationsRoute = pathname.includes("/locations");
  const searchParams = new URLSearchParams(search);
  const urlSearchString = isLocationsRoute
    ? searchParams.get("location_search") || ""
    : "";

  const [searchString, setSearchString] = useState<string>(urlSearchString);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<{
    id: number;
    title: string;
    coordinates?: { lat: number; lng: number };
  } | null>(null);
  const [deleteLocationId, setDeleteLocationId] = useState<number | null>(null);
  const [debounceSearchString, setDebounceSearchString] =
    useState<string>(urlSearchString);
  const params = useParams({ strict: false });

  const location_id = params.location_id;
  const { isOwner } = useUserDetails();

  const {
    data: locationsData,
    isLoading: isLocationsLoading,
    refetch: refetchLocations,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["userLocations", userId, debounceSearchString],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        if (!userId) throw new Error("User ID is not available");
        const queryParams: any = {
          page: pageParam,
          limit: 20,
          ...(debounceSearchString && { search_string: debounceSearchString }),
        };
        const response = await getAllUserLocations(queryParams);
        setIsDeleteDialogOpen(false);
        return response.data.data;
      } catch (error) {
        setIsDeleteDialogOpen(false);
        console.error("Error fetching locations:", error);
        throw error;
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination) return undefined;
      const { current_page, total_pages } = lastPage.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });

  const locations = locationsData?.pages.flatMap((page) => page.data) || [];
  const [totalLocations, setTotalLocations] = useState<number>(0);

  const { mutate: deleteLocation, isPending: isDeletingLocationPending } =
    useMutation({
      mutationFn: (locationId: number) => deleteLocationAPI(locationId),
      onSuccess: () => {
        toast.success("Location deleted successfully!");
        setDeleteLocationId(null);
        queryClient.invalidateQueries({ queryKey: ["userLocations"] });
      },
      onError: (error: any) => {
        if (error?.status === 409) {
          toast.error(error?.data?.message);
        } else {
          toast.error(error?.data?.message || "Failed to delete location.");
        }
      },
      retry: false,
    });

  useEffect(() => {
    const count = locationsData?.pages?.[0]?.total_loc_count;
    if (count !== undefined && count !== null) {
      setTotalLocations(count);
    }
  }, [locationsData]);

  useEffect(() => {
    onLocationsUpdate(locations);
  }, [locations, onLocationsUpdate]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchString !== debounceSearchString) {
        setDebounceSearchString(searchString);

        navigate({
          to: "/locations",
          search: (prev: any) => ({
            ...prev,
            location_search: searchString || undefined,
            search_string: undefined,
          }),
          replace: true,
        });
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchString, debounceSearchString, navigate, pathname]);

  useEffect(() => {
    if (!isLocationsRoute && searchString) {
      setSearchString("");
      setDebounceSearchString("");
    }
  }, [isLocationsRoute]);

  const handleScroll = (e: any) => {
    const container = e.currentTarget as HTMLElement;
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 20
    ) {
      fetchNextPage();
    }
  };

  const handleLocationClick = (locationId: string) => {
    navigate({
      to: "/locations/$location_id/gateways",
      params: { location_id: locationId },
    });
  };

  const handleAddLocation = () => {
    setEditingLocation(null);
    setIsLocationDialogOpen(true);
  };

  const handleEdit = (e: React.MouseEvent, location: Location) => {
    e.stopPropagation();
    setEditingLocation({
      id: location.id,
      title: location.title as string,
      coordinates: location.location_coordinates,
    });
    setIsLocationDialogOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, locationId: number) => {
    e.stopPropagation();
    setDeleteLocationId(locationId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteLocationId) {
      toast.error("Invalid location selection");
      return;
    }
    deleteLocation(deleteLocationId);

  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDeleteLocationId(null);
  };

  const handleCloseLocationDialog = () => {
    setIsLocationDialogOpen(false);
    setEditingLocation(null);
  };

  return (
    <div className="p-0 bg-white shadow-sm flex flex-col">
      <div className="flex-1 overflow-auto ">
        <div className="w-23 h-8 border border-slate-200 rounded-md overflow-hidden mx-3 mt-4">
          <SearchFilter
            searchString={searchString}
            setSearchString={setSearchString}
            title="Search locations"
            className="h-full w-full"
          />
        </div>
        <div className="flex items-center gap-2 p-4 justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <span className="text-base 3xl:!text-lg font-normal">
              Locations
            </span>
            <Badge className="bg-gray-500 text-white px-2 py-[1px] rounded-full font-light">
              {totalLocations}
            </Badge>
          </div>

          {isOwner() && (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleAddLocation}
                className="h-6 px-2 bg-green-500 hover:bg-green-600 rounded flex items-center gap-1 text-white text-xs 3xl:text-sm font-normal"
              >
                + Add Location
              </Button>
            </div>
          )}
        </div>

        {isLocationsLoading ? (
          <div className="space-y-2 px-2 h-[calc(100vh-150px)] overflow-auto">
            <LocationListSkeleton count={10} />
          </div>
        ) : locations.length > 0 ? (
          <div
            className="space-y-2 px-2 h-[calc(100vh-150px)] overflow-auto"
            onScroll={handleScroll}
          >
            {locations.map((location: Location) => (
              <div
                key={location.id}
                onClick={() => handleLocationClick(location.id.toString())}
                className={`flex items-center group justify-between gap-1 p-2 rounded-lg cursor-pointer transition-colors duration-200 border border-gray-200 ${location_id === location.id.toString()
                  ? "bg-[#E4F5E3] hover:bg-[#E4F5E3]"
                  : "hover:bg-gray-200"
                  }`}
              >
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-3">
                    <LocationSvg />
                    <span className="font-medium text-gray-800 capitalize text-sm 3xl:!text-base">
                      {location.title || "--"}
                    </span>
                  </div>
                  <span className="text-gray-600 text-xs 3xl:!text-sm ml-1">
                    {location.gateway_count || 0} gateways
                  </span>
                </div>

                {isOwner() && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={(e) => e.stopPropagation()}
                      className="p-1  rounded-md transition-colors"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-600" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-35">
                      <DropdownMenuItem
                        onClick={(e) => handleEdit(e, location)}
                        className="cursor-pointer"
                      >
                        <Pencil className="h-4 w-4 " />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleDelete(e, location.id)}
                        className="flex items-center text-red-600 focus:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 " />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
            {isFetchingNextPage && (
              <div className="flex justify-center text-sm text-gray-600">
                Loading more locations...
              </div>
            )}
            {hasNextPage && (
              <div ref={locationLoadMoreRef} className="h-4 mt-4" />
            )}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center text-gray-500 h-[calc(100vh-150px)] gap-2">
            <LocationSvg />
            <p className="text-sm">No locations found</p>
          </div>
        )}

        <DeleteDialog
          openOrNot={isDeleteDialogOpen}
          label="Are you sure you want to delete this location?"
          onCancelClick={handleDeleteCancel}
          onOKClick={handleDeleteConfirm}
          deleteLoading={isDeletingLocationPending}
          buttonLable="Yes! Delete"
          buttonLabling="Deleting..."
        />

        <LocationDialog
          isOpen={isLocationDialogOpen}
          onClose={handleCloseLocationDialog}
          locationId={editingLocation?.id}
          initialTitle={editingLocation?.title}
          initialCoordinates={editingLocation?.coordinates}
          isEditMode={!!editingLocation}
        />
      </div>
    </div>
  );
};

export default GetAllUserLocations;