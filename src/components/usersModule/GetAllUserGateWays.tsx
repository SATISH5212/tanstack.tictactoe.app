import {
  deleteLocationBasedGatewaysAPI,
  getLocationBasedGatewaysAPI,
} from "@/lib/services";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import DeleteDialog from "../core/DeleteDialog";
import { GatewayIcon } from "../svg/GatewayIcon";
import { GreenDot } from "../svg/GreenDot";
import { MotorSvg } from "../svg/MotorSvg";
import { RedDot } from "../svg/RedDot";
import { LocationSvg } from "../svg/location";
import { Badge } from "../ui/badge";
import AddGatewayComponent from "./AddGateway";
import { GatewayDevicesView } from "./ViewLocationBasedGatewayDevices";
import { useUserDetails } from "@/lib/helpers/userpermission";

interface GetAllUserGatewaysProps {
  userId: string | null;
  locations: any[];
}

const GetAllUserGateways = ({ userId, locations }: GetAllUserGatewaysProps) => {
  const { location_id } = useParams({ strict: false });
  const gatewayLoadMoreRef = useRef<HTMLDivElement>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedGatewayId, setSelectedGatewayId] = useState<string | null>(
    null
  );
  const [selectedGatewayTitle, setSelectedGatewayTitle] = useState<string>("");
  const [showDevicesView, setShowDevicesView] = useState(false);
  const { isOwner } = useUserDetails();

  const {
    data: gatewaysData,
    isLoading: isGatewaysLoading,
    refetch: refetchGateways,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["locationGateways", location_id],
    queryFn: async ({ pageParam = 1 }) => {
      if (!location_id) {
        return {
          gateways: [],
          paginationInfo: { current_page: 1, total_pages: 0, total_records: 0 },
        };
      }
      try {
        const queryParams: any = {
          page: pageParam,
          limit: 10,
        };
        const response = await getLocationBasedGatewaysAPI(
          location_id,
          queryParams
        );
        return {
          gateways: response.data.data.gateways,
          paginationInfo: response.data.data.paginationInfo,
        };
      } catch (err) {
        console.error("Error fetching gateways:", err);
        throw err;
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.paginationInfo) {
        return undefined;
      }
      const { current_page, total_pages } = lastPage.paginationInfo;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    enabled: !!location_id,
    refetchOnWindowFocus: false,
  });

  const gateways = gatewaysData?.pages.flatMap((page) => page.gateways) || [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (gatewayLoadMoreRef.current) {
      observer.observe(gatewayLoadMoreRef.current);
    }

    return () => {
      if (gatewayLoadMoreRef.current) {
        observer.unobserve(gatewayLoadMoreRef.current);
      }
    };
  }, [gatewaysData, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleViewGateway = (gatewayId: string, gatewayTitle: string) => {
    setSelectedGatewayId(gatewayId);
    setSelectedGatewayTitle(gatewayTitle);
    setShowDevicesView(true);
  };

  const handleBackToGateways = () => {
    setShowDevicesView(false);
    setSelectedGatewayId(null);
    setSelectedGatewayTitle("");
  };

  useEffect(() => {
    if (location_id) {  
      setShowDevicesView(false);
      setSelectedGatewayId(null);
      setSelectedGatewayTitle("");
    }
  }, [location_id]);

  return (
    <div className="w-full pl-5 p-3 flex flex-col gap-6">
      {showDevicesView ? (
        <div className="flex-1 overflow-auto">
          <GatewayDevicesView
            gatewayId={selectedGatewayId}
            gatewayTitle={selectedGatewayTitle}
            onBack={handleBackToGateways}
          />
        </div>
      ) : (
        <div className="p-0 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-normal">Gateways</span>
              <Badge className="bg-gray-500 text-white px-2 py-[1px] rounded-full font-light">
                {gateways.length}
              </Badge>
            </div>
            <AddGatewayComponent
              locations={locations}
              user_id={userId}
              location_id={Number(location_id)}
              refetch={refetchGateways}
              gateways={gateways}
            />
          </div>

          <div className="flex-1 overflow-auto">
            {isGatewaysLoading ? (
              <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                <img
                  src="/PeepulAgriLogo.svg"
                  alt="Logo"
                  className="w-32 h-32"
                />
              </div>
            ) : gateways.length > 0 ? (
              <div className="h-[calc(100vh-140px)]">
                <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-4 gap-4">
                  {gateways?.map((gateway: any) => (
                    <div
                      key={gateway?.id}
                      className="bg-white border-none rounded-lg p-3 pt-2 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="text-sm font-normal text-gray-800 capitalize flex items-center justify-between">
                        {gateway?.title}
                        <div className="flex items-center gap-1">
                          {gateway?.status === "ACTIVE" ? (
                            <>
                              <GreenDot />
                              <span className="text-[11px] text-green-600">
                                Active
                              </span>
                            </>
                          ) : (
                            <>
                              <RedDot />
                              <span className="text-xs text-red-600">
                                Inactive
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <LocationSvg />
                        <span className="text-xs text-gray-600 capitalize">
                          {gateway?.location?.title || "No Location"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MotorSvg />
                        <span className="text-xs">
                          Starters: {gateway?.starter_count}
                        </span>
                      </div>
                      <div
                        className={`flex gap-2 border-t border-gray-100 pt-2 ${isOwner() ? "justify-between gap-2" : "justify-center"}`}
                      >
                        <button
                          className="text-[13px] 3xl:!text-base px-3 py-1 border rounded-md border-gray-300 w-1/2"
                          onClick={() =>
                            handleViewGateway(gateway?.id, gateway?.title)
                          }
                        >
                          View
                        </button>
                        <DeleteDialog
                          openOrNot={openDeleteDialog === gateway?.id}
                          label={`Are you sure you want to delete ${gateway?.title}?`}
                          onCancelClick={() => setOpenDeleteDialog(null)}
                          onOKClick={async () => {
                            setDeleteLoading(true);
                            try {
                              await deleteLocationBasedGatewaysAPI(gateway?.id);
                              toast.success("Gateway deleted successfully");
                              refetchGateways();
                            } catch (err) {
                              console.error("Error deleting gateway:", err);
                              toast.error("Failed to delete gateway");
                            } finally {
                              setDeleteLoading(false);
                              setOpenDeleteDialog(null);
                            }
                          }}
                          deleteLoading={deleteLoading}
                          buttonLable="Delete"
                          buttonLabling="Deleting..."
                        />
                        {isOwner() && (
                          <button
                            className="text-[13px] 3xl:!text-base px-3 py-1 border rounded-md border-gray-300 w-1/2 "
                            onClick={() => setOpenDeleteDialog(gateway?.id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {isFetchingNextPage && (
                    <div className="flex justify-center text-sm text-gray-600">
                      Loading more gateways...
                    </div>
                  )}
                  {hasNextPage && (
                    <div ref={gatewayLoadMoreRef} className="h-4 mt-4" />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)] text-gray-500 ">
                <GatewayIcon className="h-20 w-20 " />
                <span>No gateways found for this location</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GetAllUserGateways;
