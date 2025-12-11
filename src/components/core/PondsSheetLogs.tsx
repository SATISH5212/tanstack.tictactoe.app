import dayjs from "dayjs";

import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { ChevronDown, X } from "lucide-react";
import { useRef, useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "src/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "src/components/ui/tabs";
import { capitalize } from "src/lib/helpers/capitalize";
import { LogsSheetProps } from "src/lib/interfaces/logs";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { formatDateToIST } from "@/lib/helpers/formatNumber";
import LogsIcon from "../svg/LogsSvg";
dayjs.extend(utc);
dayjs.extend(timezone);

export const PondsSheetLogs: React.FC<LogsSheetProps> = ({
  pondTitle,
  refetch,
  refetchDeviceLogs,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  fetchNextDevicePage,
  hasNextDevicePage,
  isFetchingNextDevicePage,
  logs,
  pond,
  devicelogs,
  pondId,
  handlepondClick,
  handleDeviceClick,
  isLoading,
  isLoadingDevice,
  ipv6,
  deviceLogStatus,
  handleStatusToggle,
}) => {
  const [activeTab, setActiveTab] = useState("pondLogs");
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const deviceLogContainerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "motorLogs" && pondId) {
      refetchDeviceLogs();
      handleDeviceClick(ipv6);
      handleStatusToggle(null);
    }
    if (value === "pondLogs") {
      refetch();
      handlepondClick(pondId);
      handleStatusToggle(null);
    }
  };
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

  const handleDeviceScroll = (e: React.SyntheticEvent) => {
    const container = e.currentTarget as HTMLDivElement;
    if (
      hasNextDevicePage &&
      !isFetchingNextDevicePage &&
      container.scrollTop + container.clientHeight >=
        container.scrollHeight - 10
    ) {
      fetchNextDevicePage();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          onClick={() => {
            handlepondClick(pondId);
          }}
          variant="outline"
          className="h-fit w-fit py-1 text-xs 3xl:text-sm px-4 border-none bg-e9e9e9 shadow-none"
        >
          Logs
        </Button>
      </SheetTrigger>

      <SheetContent className="bg-white w-custom_40per sm:max-w-custom_30per  min-w-custom_30per  max-w-custom_30per  duration-200 [&>button]:bg-white [&>button]:border [&>button]:border-slate-200 [&>button]:p-1 [&>button]:hover:bg-slate-100 [&>button]:rounded-md  [&>button>svg]:size-4 [&>button>svg]:cursor-pointer">
        <div className="flex flex-row justify-between items-center  pr-10">
          <div className="flex flex-row space-x-2 items-center">
            <LogsIcon className="w-5 h-5 text-[color:var(--accent-blue)]" />
            <div className="flex flex-col">
              <div className="text-md text-green-600 font-semibold">
                {pondTitle ? capitalize(pondTitle) : "Pond"} Logs
              </div>
              <div className="text-xs text-[color:var(--text-muted)]">
                {activeTab === "pondLogs"
                  ? "Pond activity"
                  : "Motor activity & events"}
              </div>
            </div>
          </div>

          {activeTab === "motorLogs" && (
            <div className="flex flex-row   rounded overflow-hidden">
              <Select
                value={deviceLogStatus === null ? "all" : deviceLogStatus}
                onValueChange={(value) =>
                  handleStatusToggle(
                    value === "all" ? null : (value as "on" | "off" | "mode")
                  )
                }
              >
                <SelectTrigger className="w-20 px-3 py-2 text-xs font-medium bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none ">
                  <SelectValue
                    placeholder={deviceLogStatus === null ? "ALL" : undefined}
                  />
                  <ChevronDown className="h-4 w-4" />
                </SelectTrigger>
                <SelectContent className="bg-white p-0 border min-w-10">
                  <SelectItem
                    value="all"
                    className={
                      deviceLogStatus === "all"
                        ? "bg-green-200 hover:bg-green-100 w-25"
                        : "hover:bg-green-100"
                    }
                  >
                    ALL
                  </SelectItem>
                  <SelectItem
                    value="on"
                    className={
                      deviceLogStatus === "on"
                        ? "bg-green-200 hover:bg-green-100"
                        : "hover:bg-green-100"
                    }
                  >
                    ON
                  </SelectItem>
                  <SelectItem
                    value="off"
                    className={
                      deviceLogStatus === "off"
                        ? "bg-green-200 hover:bg-green-100"
                        : "hover:bg-green-100"
                    }
                  >
                    OFF
                  </SelectItem>
                  <SelectItem
                    value="mode"
                    className={
                      deviceLogStatus === "mode"
                        ? "bg-green-200 hover:bg-green-100"
                        : "hover:bg-green-100"
                    }
                  >
                    MODE
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <button className="absolute right-5 top-4"
            onClick={() => setIsOpen(false)}>
            <X className="w-6 h-6 cursor-pointer text-red-500 p-1 rounded-full hover:bg-red-100 hover:text-red-600" />
          </button>
        </div>

        <div className="space-y-4  mt-3   ">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full  h-[calc(100vh-100px)] overflow-y-scroll"
          >
            <TabsList className="grid w-full grid-cols-2 gap-4  items-center mb-4">
              <TabsTrigger
                value="pondLogs"
                className={`py-2 text-xs   2xl:text-md 3xl:text-base font-medium rounded-md transition-colors duration-200 ${
                  activeTab === "pondLogs"
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                <span>Pond Logs</span>
              </TabsTrigger>

              <TabsTrigger
                value="motorLogs"
                className={`py-2 text-sm 2xl:text-md 3xl:text-base font-medium rounded-md transition-colors duration-200 ${
                  activeTab === "motorLogs"
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                <div onClick={() => handleDeviceClick(ipv6)}>Motor Logs</div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pondLogs" className="mt-0">
              <div
                ref={logContainerRef}
                onScroll={handleScroll}
                className="text-sm text-black h-logs_sheet overflow-auto"
              >
                {isLoading && logs.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">Loading pond logs...</span>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No pond logs found.</span>
                  </div>
                ) : (
                  <>
                    {logs.map((log, index) => (
                      <div key={index} className="border-b py-3 font-inter">
                        <div className="text-xs 3xl:text-sm font-normal font-inter text-828282">
                          {log.created_at
                            ? formatDateToIST(log.created_at)
                            : "--"}
                        </div>
                        <div className="text-smd 3xl:text-base text-333 font-medium font-inter">
                          {log.log_data}
                        </div>
                      </div>
                    ))}

                    {isFetchingNextPage && (
                      <div className="flex justify-center py-2 ">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent value="motorLogs" className="mt-0">
              <div
                ref={deviceLogContainerRef}
                onScroll={handleDeviceScroll}
                className="text-sm text-black  h-logs_sheet overflow-auto"
              >
                {isLoadingDevice && devicelogs.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">Loading motor logs...</span>
                  </div>
                ) : !Array.isArray(devicelogs) || devicelogs.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No motor logs found.</span>
                  </div>
                ) : (
                  <>
                    {devicelogs.map((log: any, index: number) => (
                      <div
                        key={log.id || index}
                        className="border-b py-3 font-inter"
                        onClick={() => handleDeviceClick(log.device_ipv6)}
                      >
                        <div className="text-xs 3xl:text-sm font-normal font-inter text-828282">
                          {log.created_at
                            ? formatDateToIST(log.created_at)
                            : "--"}
                        </div>
                        <div
                          className="text-smd 3xl:text-base text-333 font-medium font-inter"
                          dangerouslySetInnerHTML={{
                            __html: log.log_data.replace(
                              /(turned\s+(OFF|ON)|updated\s+from\s+(LOCAL|REMOTE)\s*\+\s*(AUTO|MANUAL)\s+to\s+((LOCAL|REMOTE)\s*\+\s*(AUTO|MANUAL)))/gi,
                              (
                                match: string,
                                group1: string,
                                group2: string,
                                group3: string,
                                group4: string,
                                group5: string
                              ) => {
                                if (group2) {
                                  return `<span>turned <span class="${
                                    group2.toUpperCase() === "OFF"
                                      ? "text-red-600"
                                      : "text-green-600"
                                  }">${group2}</span></span>`;
                                }
                                if (group5) {
                                  return `<span>updated from ${group3} + ${group4} to </span><span class="text-orange-600">${group5}</span>`;
                                }
                                return match;
                              }
                            ),
                          }}
                        />
                      </div>
                    ))}
                    {isFetchingNextDevicePage && (
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
