import { useState, useEffect, useCallback, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Loader2, X } from "lucide-react";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { Input } from "../ui/input";
import {
  AssignDeviceToUserAPI,
  UpdateAssignDeviceToUserAPI,
} from "@/lib/services/deviceses";
import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { NoDataDevice } from "../svg/NoDataDeviceSvg";

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

export const UserDeviceDetailsCard = ({ refetch }: any) => {
  const { user_id } = useParams({ strict: false });
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleDrawerClose = () => {
    setIsOpen(false);
    setSearchTerm("");
    setSelectedCardId(null);
  };

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
    isError,
    isLoading,
    refetch: AssignDevice,
  } = useInfiniteQuery({
    queryKey: ["cardData", debouncedSearchTerm],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await AssignDeviceToUserAPI({
        page: pageParam,
        search_string: debouncedSearchTerm,
        limit: 10,
      });

      return response.data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination) {
        return undefined;
      }
      const { current_page, total_pages } = lastPage.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    enabled: isOpen,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
  const devices = data?.pages.flatMap((page) => page.records || []) || [];

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      const { scrollTop, clientHeight, scrollHeight } = container;
      const threshold = 100;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;
      if (isNearBottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const mutation = useMutation({
    mutationFn: (cardId: any) =>
      UpdateAssignDeviceToUserAPI({
        starter_id: cardId,
        user_id: Number(user_id),
      }),
    onSuccess: (data: any) => {
      toast.success(data?.data?.message);
      setSelectedCardId(null);
      setIsOpen(false);
      refetch();
    },
    onError: (error) => {
      console.error("Error assigning device:", error);
      toast.error(error?.message);
    },
  });

  useEffect(() => {
    if (isOpen) {
      AssignDevice();
    }
  }, [isOpen, debouncedSearchTerm, AssignDevice]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSearchTerm("");
  };

  const handleCardClick = (cardId: string) => {
    setSelectedCardId(cardId);
  };

  const handleConfirmAssign = () => {
    if (selectedCardId) {
      mutation.mutate(selectedCardId);
    }
  };

  const handleCancelAssign = () => {
    setSelectedCardId(null);
  };

  return (
    <div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            onClick={handleOpenModal}
            className="h-6 px-2 bg-green-500 hover:bg-green-600 rounded flex items-center gap-1 text-white text-xs 3xl:text-sm cursor-pointer font-normal"
          >
            <span>+ Add</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          className="bg-white w-custom_40per sm:max-w-custom_30per min-w-custom_30per max-w-custom_30per px-6 py-0 font-inter [&>button]:hidden overflow-y-auto"
          onScroll={handleScroll}
          ref={logContainerRef}
        >
          <SheetHeader>
            <div className="flex items-center justify-between pt-2">
              <SheetTitle className="font-inter text-black/80 font-normal text-md 3xl:text-lg">
                Add Device
              </SheetTitle>

              <button>
                <X
                  className="w-6 h-6 cursor-pointer text-red-500 p-1 rounded-full hover:bg-red-100 hover:text-red-600"
                  onClick={() => handleDrawerClose()}
                />
              </button>
            </div>
          </SheetHeader>
          <div className="pt-4 pb-2 relative">
            <Input
              placeholder="Search devices..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pr-10 text-xs"
            />
            {searchTerm && (
              <div
                onClick={handleClear}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center"
              >
                <X className="h-4 w-4 cursor-pointer hover:bg-gray-200 rounded-sm flex-shrink-0 mt-2" />
              </div>
            )}
          </div>
          <div className="grid gap-4 pt-2 pb-12">
            {isLoading && !isFetchingNextPage ? (
              <div className="flex justify-center items-center h-[70vh]">
                <img
                  src="/PeepulAgriLogo.svg"
                  alt="Logo"
                  className="w-32 h-32"
                />
              </div>
            ) : devices?.length > 0 ? (
              devices?.map((card) => (
                <Card
                  key={card.id}
                  className="w-full cursor-pointer bg-gray-200"
                  onClick={() => handleCardClick(card.id)}
                >
                  <CardContent className="text-xs mt-4 ">
                    <div>
                      <span>
                        MCU Serial Number: {card?.mcu_serial_no || "--"}
                      </span>
                    </div>
                    <div>
                      <span>Pcb Number: {card?.pcb_number || "--"}</span>
                    </div>
                    <div>
                      <span>MAC Address: {card?.mac_address || "--"}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="h-[70vh] w-full flex flex-col items-center justify-center ">
                <NoDataDevice />
                <p className="text-gray-500 text-sm">No devices found.</p>
              </div>
            )}
            {isFetchingNextPage && (
              <div className="flex justify-center items-center">
                <Loader2 className="animate-spin h-6 w-6" />
              </div>
            )}
            {selectedCardId && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <p>Are you sure you want to assign this device?</p>
                  <div className="mt-4 flex justify-end gap-4">
                    <Button
                      variant="outline"
                      onClick={handleCancelAssign}
                      className="text-gray-600 hover:bg-white-100 border border-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmAssign}
                      disabled={mutation.isPending}
                      className="bg-red-400 hover:bg-red-400 text-white flex items-center gap-2"
                    >
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4" />
                          Assign
                        </>
                      ) : (
                        "Assign"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default UserDeviceDetailsCard;
