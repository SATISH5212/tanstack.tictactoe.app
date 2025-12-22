import { useInfiniteQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useCallback, useRef, useState } from "react";
import { Sheet, SheetContent, SheetOverlay } from "src/components/ui/sheet";

import { formatText } from "@/lib/helpers/capitalize";
import { formatDateToIST } from "@/lib/helpers/formatNumber";
import {
  getAllDeviceLogsAPI,
  getAllDeviceStatusLogsAPI,
} from "@/lib/services/devices";
import LogsIcon from "../svg/LogsSvg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { X } from "lucide-react";
dayjs.extend(utc);
dayjs.extend(timezone);

export const DeviceLogs = ({
  motorId,
  open,
  setOpen,
  devicename,
}: {
  motorId: string;
  pondTitle?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  devicename?: string;
}) => {
  const searchParams = new URLSearchParams(window.location.search);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("activeTab") || "auditLogs"
  );
  const logContainerRef = useRef<HTMLDivElement>(null);

  const {
    data: auditLogsData,
    fetchNextPage: fetchNextAuditPage,
    hasNextPage: hasNextAuditPage,
    isFetchingNextPage: isFetchingNextAuditPage,
    isLoading: isLoadingAuditLogs,
  } = useInfiniteQuery({
    queryKey: ["audit-logs", motorId],
    queryFn: async ({ pageParam = 1 }) => {
      const limit = 20;
      const queryParams = {
        page: pageParam,
        limit,
      };
      const response = await getAllDeviceLogsAPI(motorId, queryParams);
      const logs = response?.data?.data?.records || [];
      const pagination = response?.data?.data?.pagination || null;
      return {
        logs,
        nextPage: logs.length === limit ? pageParam + 1 : undefined,
        pagination,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    enabled: open && !!motorId && activeTab === "auditLogs",
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const {
    data: statusLogsData,
    fetchNextPage: fetchNextStatusPage,
    hasNextPage: hasNextStatusPage,
    isFetchingNextPage: isFetchingNextStatusPage,
    isLoading: isLoadingStatusLogs,
  } = useInfiniteQuery({
    queryKey: ["status-logs", motorId],
    queryFn: async ({ pageParam = 1 }) => {
      const limit = 20;
      const queryParams = {
        page: pageParam,
        limit,
      };

      const response = await getAllDeviceStatusLogsAPI(motorId, queryParams);
      const logs = response?.data?.data?.records || [];
      const pagination = response?.data?.data?.pagination || null;
      return {
        logs,
        nextPage: logs.length === limit ? pageParam + 1 : undefined,
        pagination,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    enabled: open && !!motorId && activeTab === "statusLogs",
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    searchParams.set("activeTab", value);

    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.replaceState({}, "", newUrl);
  };

  const logs =
    activeTab === "auditLogs"
      ? auditLogsData?.pages.flatMap((page) => page.logs) || []
      : statusLogsData?.pages.flatMap((page) => page.logs) || [];

  const isLoading =
    activeTab === "auditLogs" ? isLoadingAuditLogs : isLoadingStatusLogs;
  const hasNextPage =
    activeTab === "auditLogs" ? hasNextAuditPage : hasNextStatusPage;
  const isFetchingNextPage =
    activeTab === "auditLogs"
      ? isFetchingNextAuditPage
      : isFetchingNextStatusPage;
  const fetchNextPage =
    activeTab === "auditLogs" ? fetchNextAuditPage : fetchNextStatusPage;

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

  const formatFieldName = (fieldName: string) => {
    if (!fieldName) return "--";
    return fieldName.replace(/_/g, " ");
  };

  const title = devicename || "Device";

  const formattedTitle =
    title !== "-"
      ? title.charAt(0).toUpperCase() + title.slice(1).toLowerCase()
      : title;

  const displayText =
    formattedTitle?.length > 15
      ? `${formattedTitle.slice(0, 12)}...`
      : formattedTitle;


  const renderLogItem = (log: any, index: number) => {
    if (activeTab === "auditLogs") {
      return (
        <div key={`${log.id || index}`} className="border-b py-2 font-inter">
          <div className="text-smd 3xl:text-base text-lg font-medium font-inter">
            <div className="flex gap-3">
              <div>{formatText(formatFieldName(log.field_name)) || "--"}</div>-
              <div className="text-828282">
                {log.created_at ? formatDateToIST(log.created_at) : "--"}
              </div>
            </div>
          </div>
          <div className="text-smd 3xl:text-base font-inter">
            <span className="font-normal ">Updated from</span>
            <span className="text-md 3xl:text-base font-normal text-primary_text ml-2">
              {log.old_value || "--"}
            </span>
            <span className="font-normal mx-2">to</span>
            <span className="text-md 3xl:text-base font-normal text-primary_text">
              {log.new_value || "--"}
            </span>
          </div>
        </div>
      );
    } else {
      return (
        <div key={`${log.id || index}`} className="border-b py-2 font-inter">
          <div className="text-smd 3xl:text-base text-lg font-medium font-inter">
            <div className="flex gap-3">
              <div className="text-828282">
                {log.changed_at ? formatDateToIST(log.changed_at) : "--"}
              </div>
            </div>
          </div>
          <div className="text-smd 3xl:text-base font-inter">
            <span className="font-normal ">Updated from</span>
            <span className="text-md 3xl:text-base font-normal text-primary_text ml-2">
              {log.previous_status || "--"}
            </span>
            <span className="font-normal mx-2">to</span>
            <span className="text-md 3xl:text-base font-normal text-primary_text">
              {log.new_status || "--"}
            </span>
          </div>
        </div>
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetOverlay className="bg-black/10" />
      <SheetContent className="bg-white w-custom_40per sm:max-w-custom_30per min-w-custom_30per max-w-custom_30per duration-200 [&>button]:bg-white [&>button]:border [&>button]:border-slate-200 [&>button]:p-1 [&>button]:hover:bg-slate-100 [&>button]:rounded-md [&>button>svg]:size-4 [&>button>svg]:cursor-pointer">
        <div className=" flex items-start justify-between">
          <div className="flex items-center gap-3">
            <LogsIcon className="w-5 h-5 text-green-600" />
            <div>
              <div
                className="text-md font-semibold text-green-600 cursor-default"
                title={formattedTitle}
              >
                {displayText}  Logs
              </div>
              <div className="text-xs text-gray-500">
                {activeTab === "auditLogs"
                  ? "Audit activity"
                  : "Status changes"}
              </div>
            </div>
          </div>
          <button>
            <X
              className="w-6 h-6 cursor-pointer text-red-500 p-1 rounded-full hover:bg-red-100 hover:text-red-600"
              onClick={() => setOpen(false)}
            />
          </button>
        </div>
        <div className=" mt-3">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 gap-4 items-center ">
              <TabsTrigger
                value="auditLogs"
                className={`py-2 text-sm 2xl:text-md 3xl:text-base font-medium rounded-md transition-colors duration-200 ${activeTab === "auditLogs"
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-200 text-gray-600"
                  }`}
              >
                <span>Audit Logs</span>
              </TabsTrigger>
              <TabsTrigger
                value="statusLogs"
                className={`py-2 text-sm 2xl:text-md 3xl:text-base font-medium rounded-md transition-colors duration-200 ${activeTab === "statusLogs"
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-200 text-gray-600"
                  }`}
              >
                <span>Status Logs</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="auditLogs" className="mt-4">
              <div
                ref={logContainerRef}
                onScroll={handleScroll}
                className="text-sm text-black h-logs_sheet overflow-auto"
              >
                {isLoading && logs.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">Loading audit logs...</span>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No audit logs found.</span>
                  </div>
                ) : (
                  <>
                    {logs.map(renderLogItem)}
                    {isFetchingNextPage && (
                      <div className="flex justify-center py-2">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent value="statusLogs" className="mt-4">
              <div
                ref={logContainerRef}
                onScroll={handleScroll}
                className="text-sm text-black h-logs_sheet overflow-auto"
              >
                {isLoading && logs.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">
                      Loading status logs...
                    </span>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No status logs found.</span>
                  </div>
                ) : (
                  <>
                    {logs.map(renderLogItem)}
                    {isFetchingNextPage && (
                      <div className="flex justify-center py-2">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};
