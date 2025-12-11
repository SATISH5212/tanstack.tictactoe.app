import { useInfiniteQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useCallback, useEffect, useRef, useState } from "react";
import { Sheet, SheetContent } from "src/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "src/components/ui/tabs";
import { getUserBasedFaultLogsAPI } from "src/lib/services/users";

dayjs.extend(utc);
dayjs.extend(timezone);

export const AlertPondLogs = ({
  motorId,
  pondTitle,
  open,
  setOpen,
  initialTab = "alertLogs",
}: {
  motorId: string;
  pondTitle?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  initialTab?: "alertLogs" | "faultLogs";
}) => {
  const [activeTab, setActiveTab] = useState<"alertLogs" | "faultLogs">(
    initialTab
  );
  const {
    data: logsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingLogs,
    refetch: refetchLogs,
  } = useInfiniteQuery({
    queryKey: ["motor-logs", motorId, activeTab],
    queryFn: async ({ pageParam = 1 }) => {
      const limit = 20;
      const queryParams = {
        ...(activeTab === "faultLogs" && { logs: "faults" }),
        page: pageParam,
        limit,
      };
      const response = await getUserBasedFaultLogsAPI(motorId, queryParams);
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
    enabled: open && !!motorId,
    refetchOnWindowFocus: false,
  });

  const logs = logsData?.pages.flatMap((page) => page.logs) || [];

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

  useEffect(() => {
    if (open && motorId) {
      refetchLogs();
    }
  }, [open, activeTab, motorId, refetchLogs]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as "alertLogs" | "faultLogs");
  };

  const renderLogItem = (log: any, index: number) => (
    <div
      key={`${log.id || index}-${log.timestamp}`}
      className="border-b py-3 font-inter"
    >
      <div className="text-smd 3xl:text-base text-333 font-medium font-inter">
        {activeTab === "alertLogs"
          ? log.alert_description || "--"
          : log.fault_description || "--"}
      </div>
      <div className="text-xs 3xl:text-sm font-normal font-inter text-828282">
        {dayjs
          .utc(log.timestamp)
          .tz("Asia/Kolkata")
          .format("YYYY-MM-DD hh:mm A")}
      </div>
    </div>
  );

  const renderTabContent = (tabType: "alertLogs" | "faultLogs") => (
    <TabsContent value={tabType} className="mt-0">
      <div className="flex items-center gap-2 my-4"></div>
      <div
        // ref={logContainerRef}
        onScroll={handleScroll}
        className="text-sm text-black h-logs_sheet overflow-auto"
        style={{
          overflowY: "auto",
          maxHeight: "100%",
        }}
      >
        {isLoadingLogs && logs.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400">
              Loading {tabType === "alertLogs" ? "alert" : "fault"} logs...
            </span>
          </div>
        ) : logs.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400">
              No {tabType === "alertLogs" ? "alert" : "fault"} logs found.
            </span>
          </div>
        ) : (
          <>
            {logs.map(renderLogItem)}
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            )}
          </>
        )}
      </div>
    </TabsContent>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="bg-white w-custom_40per sm:max-w-custom_30per min-w-custom_30per max-w-custom_30per duration-200 [&>button]:bg-white [&>button]:border [&>button]:border-slate-200 [&>button]:p-1 [&>button]:hover:bg-slate-100 [&>button>svg]:size-4 [&>button>svg]:cursor-pointer">
        <div className="space-y-4 mt-8">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 gap-3">
              <TabsTrigger
                value="alertLogs"
                className={`py-2 text-sm 2xl:text-md 3xl:text-base font-medium rounded-md transition-colors duration-200 ${activeTab === "alertLogs"
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-200 text-gray-600"
                  }`}
              >
                Alert Logs
              </TabsTrigger>
              <TabsTrigger
                value="faultLogs"
                className={`py-2 text-sm 2xl:text-md 3xl:text-base font-medium rounded-md transition-colors duration-200 ${activeTab === "faultLogs"
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-200 text-gray-600"
                  }`}
              >
                Fault Logs
              </TabsTrigger>
            </TabsList>

            {renderTabContent("alertLogs")}
            {renderTabContent("faultLogs")}
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AlertPondLogs;
