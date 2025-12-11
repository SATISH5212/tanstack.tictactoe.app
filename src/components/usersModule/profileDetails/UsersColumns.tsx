import AddIcon from "@/components/icons/apfc/AddIcon";
import { DeleteDeviceIcon } from "@/components/svg/DeletePond";
import { EditDeviceIcon } from "@/components/svg/EditDevice";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { userTypeConstants } from "@/lib/constants/exportDeviceData";
import {
  assignLocationToUserAPI,
  assignPondToUserAPI,
  getAllUserLocations,
  removeAssignedUserLocationAPI,
  removeAssignedUserPondsAPI,
} from "@/lib/services";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import AssignLocationToUser from "./AssignLocationToUser";
import AssignPondToUser from "./AssignPondToUser";
import DeleteDialog from "@/components/core/DeleteDialog";

export const UserColumnsList = (
  onEditUser?: (user: any) => void,
  onDeleteUser?: (user: any) => void,
  refetchUsers?: () => Promise<any>,
  setTableLoading?: (loading: boolean) => void
) => {
  const queryClient = useQueryClient();
  const [searchString, setSearchString] = useState("");
  const [debounceSearchString, setDebounceSearchString] = useState("");
  const locationLoadMoreRef = useRef<HTMLDivElement>(null);
  const [selectedLocations, setSelectedLocations] = useState<{
    [userId: number]: string;
  }>({});

  const {
    data: locationsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLocationsLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["locations", debounceSearchString],
    queryFn: async ({ pageParam = 1 }) => {
      const queryParams: any = {
        page: pageParam,
        page_size: 10,
      };
      if (debounceSearchString) {
        queryParams.search_string = debounceSearchString;
      }
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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceSearchString(searchString);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchString]);

  useEffect(() => {
    if (!locationLoadMoreRef.current) return;
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
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, isLocationsLoading]);

  const COLUMN_STYLES = {
    row: "p-2 h-[40px] flex items-start overflow-hidden text-ellipsis whitespace-nowrap text-xs 3xl:text-sm ",
  };
  return [
    {
      accessorFn: (row: any) => row?.full_name,
      id: "full_name",
      cell: (info: any) => {
        const value = info.getValue() || "-";
        const isLongName = value !== "-" && value.length > 20;
        const displayValue = isLongName ? `${value.slice(0, 20)}...` : value;
        return (
          <div
            className={COLUMN_STYLES.row}
            title={isLongName ? value : undefined}
          >
            <span className="capitalize">{displayValue}</span>
          </div>
        );
      },
      header: () => <span>Full Name</span>,
      footer: (props: any) => props.column.id,
      size: 150,
    },
    {
      accessorFn: (row: any) => row?.email,
      id: "email",
      cell: (info: any) => {
        const value = info.getValue() || "-";
        const isLongEmail = value !== "-" && value.length > 20;
        const displayValue = isLongEmail ? `${value.slice(0, 20)}...` : value;
        return (
          <div
            className={COLUMN_STYLES.row}
            title={isLongEmail ? value : undefined}
          >
            <span>{displayValue.toLowerCase()}</span>
          </div>
        );
      },
      header: () => <span>Email</span>,
      footer: (props: any) => props.column.id,
      size: 120,
    },
    {
      accessorFn: (row: any) => row?.phone,
      id: "phone",
      cell: (info: any) => {
        const value = info.getValue() || "-";
        return (
          <div className={COLUMN_STYLES.row}>
            <span>{value}</span>
          </div>
        );
      },
      header: () => <span>Phone</span>,
      footer: (props: any) => props.column.id,
      size: 100,
    },
    {
      accessorFn: (row: any) => row?.user_type,
      id: "user_type",
      cell: (info: any) => {
        const value = info.getValue() || "-";
        return (
          <div className={COLUMN_STYLES.row}>
            {userTypeConstants.find((item) => item.value === value)?.label ||
              "-"}
          </div>
        );
      },
      header: () => <span className="w-full">User Type</span>,
      footer: (props: any) => props.column.id,
      size: 100,
    },
    {
      accessorFn: (row: any) => row.locations,
      id: "assign_location",
      cell: (info: any) => {
        const userId = info.row.original.id;
        const locations = info.row.original.locations || [];
        const [assignDialogOpen, setAssignDialogOpen] = useState(false);
        const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
        const [locationToRemove, setLocationToRemove] = useState<number | null>(
          null
        );

        const queryClient = useQueryClient();
        const { mutate: assignLocation, isPending: isAssignPending } =
          useMutation({
            mutationFn: (locationId: number) =>
              assignLocationToUserAPI({
                user_id: userId,
                location_id: locationId,
              }),
            onSuccess: async (response: any) => {
              if (response?.status === 200 || response?.status === 201) {
                toast.success(
                  response?.data?.message || "Location assigned successfully"
                );
                setTableLoading?.(true);
                try {
                  await queryClient.invalidateQueries({
                    queryKey: ["profileData"],
                  });
                } finally {
                  setTableLoading?.(false);
                }
                queryClient.invalidateQueries({ queryKey: ["locations"] });
                setAssignDialogOpen(false);
                setAssignDialogOpen(false);
              }
            },
            onError: (error: any) => {
              toast.error(error?.data?.message || "Failed to assign location");
            },
          });

        const { mutate: removeLocation, isPending: isRemovePending } =
          useMutation({
            mutationFn: () =>
              removeAssignedUserLocationAPI({
                user_id: userId,
                location_id: locationToRemove!,
              }),
            onSuccess: async (response: any) => {
              toast.success(
                response?.data?.message || "Location removed successfully"
              );
              setTableLoading?.(true);
              try {
                await queryClient.invalidateQueries({
                  queryKey: ["profileData"],
                });
                await refetchUsers?.();
              } finally {
                setTableLoading?.(false);
              }
              queryClient.invalidateQueries({ queryKey: ["locations"] });
              setIsRemoveDialogOpen(false);
              setLocationToRemove(null);
            },
            onError: (error: any) => {
              toast.error(error?.data?.message || "Failed to remove location");
            },
          });

        const handleAssignLocation = () => {
          setAssignDialogOpen(true);
        };

        const handleRemoveClick = (locationId: number, e: React.MouseEvent) => {
          e.stopPropagation();
          setLocationToRemove(locationId);
          setIsRemoveDialogOpen(true);
        };

        const handleRemoveConfirm = () => {
          if (locationToRemove) {
            removeLocation();
          }
        };

        const remainingLocations = locations.slice(2);

        return (
          <div
            className={COLUMN_STYLES.row}
            onClick={(e) => e.stopPropagation()}
          >
            {locations.length > 0 ? (
              <div className="flex items-center gap-1.5">
                {locations.slice(0, 2).map((location: any) => (
                  <div
                    key={location.id}
                    className="bg-blue-100 max-w-25 h-5 rounded-full flex items-center overflow-hidden capitalize px-2"
                    title={location.title || "--"}
                  >
                    <p className="text-2xs font-normal text-black text-ellipsis truncate">
                      {location.title}
                    </p>
                    <span
                      onClick={(e) => handleRemoveClick(location.id, e)}
                      className="text-2xs font-normal text-black ml-1"
                    >
                      <X  className="w-3 h-3 text-black/60 hover:text-red-700" />
                    </span>
                  </div>
                ))}
                {locations.length > 2 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-blue-100 w-6 h-5 rounded-full flex items-center justify-center overflow-hidden cursor-pointer">
                          <p className="text-2xs font-medium text-black">
                            +{locations.length - 2}
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        align="start"
                        className="max-w-sm max-h-40 overflow-auto bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.1)]"
                      >
                        <div className="flex flex-col gap-2 p-1">
                          {remainingLocations.map((location: any) => (
                            <div className="flex items-center justify-between">
                              <p
                                key={location.id}
                                className="text-xs capitalize"
                              >
                                {location.title || "--"}
                              </p>
                              <span
                                onClick={(e) =>
                                  handleRemoveClick(location.id, e)
                                }
                                className="text-2xs font-normal text-black ml-1"
                              >
                                <X className="w-3 h-3 text-black/60 cursor-pointer hover:text-red-700" />
                              </span>
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            ) : (
              <span className="text-gray-400 text-xs">--</span>
            )}
            <AddIcon
              className="size-3.5 cursor-pointer text-neutral-600 mt-0.5 ml-1"
              onClick={(e: any) => {
                e.stopPropagation();
                handleAssignLocation();
              }}
            />
            <AssignLocationToUser
              open={assignDialogOpen}
              onClose={() => setAssignDialogOpen(false)}
              getData={() =>
                queryClient.invalidateQueries({ queryKey: ["profileData"] })
              }
              user_id={userId}
              isPending={isAssignPending}
              assignLocation={assignLocation}
              userLocations={locations}
            />
            <DeleteDialog
              openOrNot={isRemoveDialogOpen}
              label="Any ponds present in this location will also be removed."
              onCancelClick={() => {
                setIsRemoveDialogOpen(false);
                setLocationToRemove(null);
              }}
              onOKClick={handleRemoveConfirm}
              deleteLoading={isRemovePending}
              buttonLable="Yes! Remove"
              buttonLabling="Removing..."
            />
          </div>
        );
      },
      header: () => <span className=" w-full">Assigned Locations</span>,
      footer: (props: any) => props.column.id,
      size: 150,
    },
    {
      accessorFn: (row: any) => row.ponds,
      id: "assign_pond",
      cell: (info: any) => {
        const userId = info.row.original.id;
        const ponds = info.row.original.ponds || [];
        const locationId = selectedLocations[userId] || null;
        const [assignDialogOpen, setAssignDialogOpen] = useState(false);
        const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
        const [pondToRemove, setPondToRemove] = useState<number | null>(null);

        const { mutate: assignPond, isPending: isAssignPending } = useMutation({
          mutationFn: (pondId: number) =>
            assignPondToUserAPI({
              user_id: userId,
              pond_id: pondId,
              location_id: locationId ? Number(locationId) : null,
            }),
          onSuccess: async (response: any) => {
            toast.success(
              response?.data?.message || "Pond assigned successfully"
            );
            setTableLoading?.(true);
            try {
              await queryClient.invalidateQueries({
                queryKey: ["profileData"],
              });
            } finally {
              setTableLoading?.(false);
            }
            queryClient.invalidateQueries({ queryKey: ["ponds"] });
            setAssignDialogOpen(false);
          },
          onError: (error: any) => {
            toast.error(error?.data?.message || "Failed to assign pond");
          },
        });

        const { mutate: removePond, isPending: isRemovePending } = useMutation({
          mutationFn: () => {
            const payload = { user_id: userId };
            return removeAssignedUserPondsAPI(pondToRemove!, payload);
            ;
          },
          onSuccess: async (response: any) => {
            toast.success(
              response?.data?.message || "Pond removed successfully"
            );
            setTableLoading?.(true);
            try {
              await queryClient.invalidateQueries({
                queryKey: ["profileData"],
              });
              await refetchUsers?.();
            } finally {
              setTableLoading?.(false);
            }
            queryClient.invalidateQueries({ queryKey: ["ponds"] });
            setIsRemoveDialogOpen(false);
            setPondToRemove(null);
          },
          onError: (error: any) => {
            toast.error(error?.data?.message || "Failed to remove pond");
          },
        });

        const handleRemoveClick = (pondId: number, e: React.MouseEvent) => {
          e.stopPropagation();
          setPondToRemove(pondId);
          setIsRemoveDialogOpen(true);
        };

        const handleRemoveConfirm = () => {
          if (pondToRemove) {
            removePond();
          }
        };

        const handleAssignUser = () => {
          setAssignDialogOpen(true);
        };

        const remainingPonds = ponds.slice(2);

        return (
          <div
            className={COLUMN_STYLES.row}
            onClick={(e) => e.stopPropagation()}
          >
            {ponds.length > 0 ? (
              <div className="flex items-center gap-1.5">
                {ponds.slice(0, 2).map((pond: any) => (
                  <div
                    key={pond.id}
                    className="bg-teal-100 max-w-25 h-5 rounded-full flex items-center overflow-hidden capitalize px-2"
                    title={pond.title || "--"}
                  >
                    <p className="text-2xs font-normal text-teal-800 text-ellipsis truncate">
                      {pond.title}
                    </p>
                    <span
                      onClick={(e) => handleRemoveClick(pond.id, e)}
                      className="text-2xs font-normal text-black ml-1"
                    >
                      <X className="w-3 h-3 text-black/60 hover:text-red-700" />
                    </span>
                  </div>
                ))}
                {ponds.length > 2 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-teal-100 w-6 h-5 rounded-full flex items-center justify-center overflow-hidden cursor-pointer">
                          <p className="text-2xs font-medium text-teal-800">
                            +{ponds.length - 2}
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        align="start"
                        className="max-w-sm max-h-40 overflow-auto bg-white shadow-[0px_0px_0px_1px_rgba(0,0,0,0.1)]"
                      >
                        <div className="flex flex-col gap-2 p-1">
                          {remainingPonds.map((pond: any) => (
                            <div className="flex items-center justify-between">
                              <p key={pond.id} className="text-xs capitalize">
                                {pond.title || "--"}
                              </p>
                              <span
                                onClick={(e) => handleRemoveClick(pond.id, e)}
                                className="text-2xs font-normal text-black ml-1"
                              >
                                <X className="w-3 h-3 text-black/60 cursor-pointer hover:text-red-700" />
                              </span>
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            ) : (
              <span className="text-gray-400 text-xs">--</span>
            )}
            <AddIcon
              className="size-3.5 cursor-pointer text-neutral-600 mt-0.5 ml-1"
              onClick={(e: any) => {
                e.stopPropagation();
                handleAssignUser();
              }}
            />
            <AssignPondToUser
              open={assignDialogOpen}
              onClose={() => setAssignDialogOpen(false)}
              getData={() =>
                queryClient.invalidateQueries({ queryKey: ["profileData"] })
              }
              user_id={userId}
              assignPond={assignPond}
              isPending={isAssignPending}
              locationPonds={ponds}
            />
            <DeleteDialog
              openOrNot={isRemoveDialogOpen}
              label="Are you sure you want to remove this pond?"
              onCancelClick={() => {
                setIsRemoveDialogOpen(false);
                setPondToRemove(null);
              }}
              onOKClick={handleRemoveConfirm}
              deleteLoading={isRemovePending}
              buttonLable="Yes! Remove"
              buttonLabling="Removing..."
            />
          </div>
        );
      },
      header: () => <span className=" w-full">Assigned Ponds</span>,
      footer: (props: any) => props.column.id,
      size: 150,
    },
    {
      id: "actions",
      cell: ({ row }: { row: any }) => {
        const user = row.original;
        return (
          <div
            className={`gap-2 ${COLUMN_STYLES.row} flex items-center justify-center`}
          >
            {onEditUser && (
              <button
                className="text-gray-600 hover:text-orange-500"
                onClick={() => onEditUser(user)}
                title="Edit user"
              >
                <EditDeviceIcon className="size-4" />
              </button>
            )}
            {onDeleteUser && (
              <button
                className="text-gray-600 hover:text-red-500"
                onClick={() => onDeleteUser(user)}
                title="Delete user"
              >
                <DeleteDeviceIcon className="size-4" />
              </button>
            )}
          </div>
        );
      },
      header: () => (
        <span className="text-xs 3xl:text-sm whitespace-nowrap cursor-default text-center w-full">
          Actions
        </span>
      ),
      footer: (props: any) => props.column.id,
      size: 60,
      enableSorting: false,
    },
  ];
};
