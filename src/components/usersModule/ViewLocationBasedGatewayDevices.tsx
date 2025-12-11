import { viewLocationBasedGatewaysAPI } from "@/lib/services";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { MotorOffIcon } from "../icons/stats/MotorOff";
import { GreenDot } from "../svg/GreenDot";
import { NoDataDevice } from "../svg/NoDataDeviceSvg";
import { RedDot } from "../svg/RedDot";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import UserAddDevice from "./addDevice";

interface GatewayDevicesViewProps {
  gatewayId: any;
  gatewayTitle: string;
  onBack: () => void;
}

export const GatewayDevicesView: React.FC<GatewayDevicesViewProps> = ({
  gatewayId,
  gatewayTitle,
  onBack,
}) => {
  const observerRef = useRef<HTMLDivElement>(null);
  const deviceLoadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data: deviceData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isDeviceLoading,
    error: deviceError,
  } = useInfiniteQuery({
    queryKey: ["gateway-devices", gatewayId],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const response = await viewLocationBasedGatewaysAPI(gatewayId, {
          page: pageParam,
          limit: 10,
        });
        return response.data.data;
      } catch (err) {
        console.error("Error fetching gateway devices:", err);
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
    enabled: !!gatewayId,
    refetchOnWindowFocus: false,
  });

  const allDevices =
    deviceData?.pages?.flatMap((page) => page.gatewayData.starterBox) || [];
  const total_records =
    deviceData?.pages?.[0]?.paginationInfo?.total_records || 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (deviceLoadMoreRef.current) {
      observer.observe(deviceLoadMoreRef.current);
    }

    return () => {
      if (deviceLoadMoreRef.current) {
        observer.unobserve(deviceLoadMoreRef.current);
      }
    };
  }, [allDevices, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="w-full p-0 flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 bg-transparent hover:bg-transparent border-none shadow-none p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-base 3xl:!text-lg font-normal text-gray-800 capitalize">
            {gatewayTitle}
          </h3>
          <Badge className="bg-gray-500 text-white px-2 py-[1px] rounded-full font-light">
            {total_records}
          </Badge>
        </div>
        <div className="flex justify-end">
          <UserAddDevice device={undefined} isEditMode={false} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-150px)]">
        {isDeviceLoading ? (
          <div className="flex justify-center items-center h-[calc(100vh-140px)]">
            <img src="/PeepulAgriLogo.svg" alt="Logo" className="w-32 h-32" />
          </div>
        ) : allDevices.length > 0 ? (
          <div className="min-h-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allDevices?.map((device: any, index: number) => (
                <div
                  key={device?.id || `device-${index}`}
                  className="bg-white rounded-lg p-2 pt-2 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-normal text-sm text-gray-800 capitalize">
                      {device?.alias_starter_title
                        ? device?.alias_starter_title
                        : device?.title}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] 3xl:!text-xs">
                      {device?.status === "ACTIVE" ? <GreenDot /> : <RedDot />}
                      <span>
                        {device?.status === "ACTIVE" ? "Active" : "InActive"}
                      </span>
                    </div>
                  </div>
                  {device?.pcb_number && (
                    <p className="text-xs text-gray-500 mb-2">
                      PCB: {device?.pcb_number}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-1">
                    {device?.motors?.length > 0 ? (
                      device?.motors?.map((motor: any) => (
                        <div
                          key={motor?.id}
                          className="border border-dashed rounded p-1 py-0.5 bg-gray-100 flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-xs text-gray-700 capitalize">
                              {motor?.state !== 0 ? (
                                <img
                                  src="/assets/Fan animation.svg"
                                  alt="Motor on icon"
                                  className="size-8"
                                />
                              ) : (
                                <MotorOffIcon className="w-8 h-8" />
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-xs text-gray-700 capitalize">
                              {motor?.title}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {motor?.hp} HP
                            </span>
                          </div>
                          {motor?.pond?.title && (
                            <div className="text-[10px] text-gray-500 capitalize">
                              Pond: {motor?.pond.title}
                            </div>
                          )}
                          {motor?.location?.title && (
                            <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-1 capitalize">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 text-gray-400"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                <circle cx="12" cy="9" r="2.5" />
                              </svg>
                              {motor?.location?.title}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-400 col-span-2 flex items-center justify-center h-20 rounded">
                        No motors
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isFetchingNextPage && (
                <div className="flex justify-center text-sm text-gray-600 col-span-full">
                  Loading more devices...
                </div>
              )}
              {hasNextPage && (
                <div ref={deviceLoadMoreRef} className="h-4 mt-4" />
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-gray-500 mt-40">
              <NoDataDevice />
              <span>No devices available</span>
          </div>
        )}
      </div>
    </div>
  );
};
