import { PondLogsIcon } from "@/components/icons/PondLogsIcon";
import FaultIcon from "@/components/svg/FaultIcon";
import FilterIcon from "@/components/svg/FilterIcon";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { capitalizeFirstLetter } from "@/lib/helpers/capitalize";
import { formatDateToIST } from "@/lib/helpers/formatNumber";
import { getPondAlertLogsAPI, getPondFaultLogsAPI, getUserLogsDeviceAPI } from "@/lib/services/users";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

interface PondMotorLogsProps {
    pondId: number | string;
}

type TabType = "alertLogs" | "faultLogs" | "motorLogs";
type DeviceLogStatus = "on" | "off" | "mode" | null;

const LoadingSpinner = ({ message }: { message: string }) => (
    <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin" />
            <span className="text-gray-400 text-sm">{message}</span>
        </div>
    </div>
);

const EmptyState = ({ message }: { message: string }) => (
    <div className="w-full h-full flex items-center justify-center">
        <span className="text-gray-400 text-sm">{message}</span>
    </div>
);

const PaginationLoader = () => (
    <div className="flex justify-center py-2">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
    </div>
);

const AlertLogItem = ({ log, index }: { log: any; index: number }) => (
    <div key={log.id || index} className="border-b py-1 font-inter">
        <div className="flex flex-row items-center gap-2">
            <FaultIcon className="w-6 h-6 text-orange-500 mb-2 flex-shrink-0" />
            <div className="flex flex-col min-w-0 flex-1">
                <div className="text-xs 3xl:text-sm font-normal font-inter text-828282">
                    {log?.timestamp ? formatDateToIST(log?.timestamp) : "--"}
                </div>
                <div className="text-sm break-words">
                    {log?.alert_description || "--"}
                </div>
            </div>
        </div>
    </div>
);

const FaultLogItem = ({ log, index }: { log: any; index: number }) => (
    <div key={log.id || index} className="border-b py-1 font-inter">
        <div className="flex flex-row items-center gap-2">
            <FaultIcon className="w-6 h-6 text-red-500 mb-2 flex-shrink-0" />
            <div className="flex flex-col min-w-0 flex-1">
                <div className="text-xs 3xl:text-sm font-normal font-inter text-828282">
                    {log?.timestamp ? formatDateToIST(log?.timestamp) : "--"}
                </div>
                <div className="text-sm break-words">
                    {log?.fault_description || "--"}
                </div>
            </div>
        </div>
    </div>
);


const MotorLogItem = ({ log, index }: { log: any; index: number }) => {
    const formatLogData = (logData: string) => {
        return logData.replace(
            /(turned\s+(OFF|ON)|updated\s+from\s+(LOCAL|REMOTE)\s*\+\s*(AUTO|MANUAL)\s+to\s+((LOCAL|REMOTE)\s*\+\s*(AUTO|MANUAL)))/gi,
            (match: string, _g1: string, g2: string, g3: string, g4: string, g5: string) => {
                if (g2) {
                    const color = g2.toUpperCase() === "OFF" ? "text-red-600" : "text-green-600";
                    return `<span>turned <span class="${color}">${g2}</span></span>`;
                }
                if (g5) {
                    return `<span>updated from ${g3} + ${g4} to </span><span class="text-orange-600">${g5}</span>`;
                }
                return match;
            }
        );
    };

    return (
        <div key={log.id || index} className="border-b py-1 font-inter">
            <div className="flex flex-row items-center gap-2">
                <PondLogsIcon className="w-6 h-6 text-green-800 mb-2 flex-shrink-0" />
                <div className="flex flex-col min-w-0 flex-1">
                    <div className="text-xs 3xl:text-sm font-normal font-inter text-828282">
                        {log.created_at ? formatDateToIST(log.created_at) : "--"}
                    </div>
                    <div
                        className="text-sm 3xl:text-base text-333  font-inter break-words"
                        dangerouslySetInnerHTML={{ __html: formatLogData(log.log_data) }}
                    />
                </div>
            </div>
        </div>
    );
};

const useLogQuery = (
    queryKey: (string | number | null)[],
    enabled: boolean,
    apiFunction: (params: any, pondId: any) => Promise<any>,
    pondId: number | string
) => {
    return useInfiniteQuery({
        queryKey,
        enabled,
        queryFn: async ({ pageParam = 1 }) => {
            const queryParams: any = {
                page: pageParam,
                limit: 10,
            };
            if (queryKey[0] === "device-logs" && queryKey[2]) {
                queryParams.search_string = String(queryKey[2]);
            }

            const response = await apiFunction(queryParams, pondId);
            const data = response?.data?.data;
            return {
                data: data?.records || [],
                pagination: data?.pagination || null,
            };
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (!lastPage.pagination) return undefined;
            const { current_page, total_pages } = lastPage.pagination;
            return current_page < total_pages ? current_page + 1 : undefined;
        },
        refetchOnWindowFocus: false,
    });
};

const SinglePondLogs: React.FC<PondMotorLogsProps> = ({ pondId }) => {
    const [activeTab, setActiveTab] = useState<TabType>("alertLogs");
    const [deviceLogStatus, setDeviceLogStatus] = useState<DeviceLogStatus>(null);

    const alertLogContainerRef = useRef<HTMLDivElement | null>(null);
    const faultLogContainerRef = useRef<HTMLDivElement | null>(null);
    const deviceLogContainerRef = useRef<HTMLDivElement | null>(null);
    const {
        data: alertLogsData,
        fetchNextPage: fetchNextAlertPage,
        hasNextPage: hasNextAlertPage,
        isFetchingNextPage: isFetchingNextAlertPage,
        refetch: refetchAlertLogs,
        isFetching: isFetchingAlertLogs,
    } = useLogQuery(
        ["alert-logs", String(pondId)],
        !!pondId && activeTab === "alertLogs",
        getPondAlertLogsAPI,
        pondId
    );

    const {
        data: faultLogsData,
        fetchNextPage: fetchNextFaultPage,
        hasNextPage: hasNextFaultPage,
        isFetchingNextPage: isFetchingNextFaultPage,
        refetch: refetchFaultLogs,
        isFetching: isFetchingFaultLogs,
    } = useLogQuery(
        ["fault-logs", String(pondId)],
        !!pondId && activeTab === "faultLogs",
        getPondFaultLogsAPI,
        pondId
    );

    const {
        data: deviceData,
        fetchNextPage: fetchNextDevicePage,
        hasNextPage: hasNextDevicePage,
        isFetchingNextPage: isFetchingNextDevicePage,
        refetch: refetchDeviceLogs,
        isFetching: isFetchingDeviceLogs,
    } = useLogQuery(
        ["device-logs", String(pondId), deviceLogStatus],
        !!pondId && activeTab === "motorLogs",
        getUserLogsDeviceAPI,
        pondId
    );

    const createScrollHandler = useCallback(
        (hasNextPage: boolean, isFetchingNextPage: boolean, fetchNextPage: () => void) =>
            (e: React.UIEvent<HTMLDivElement>) => {
                const container = e.currentTarget;
                if (
                    hasNextPage &&
                    !isFetchingNextPage &&
                    container.scrollTop + container.clientHeight >= container.scrollHeight - 10
                ) {
                    fetchNextPage();
                }
            },
        []
    );

    const handleAlertScroll = createScrollHandler(hasNextAlertPage, isFetchingNextAlertPage, fetchNextAlertPage);
    const handleFaultScroll = createScrollHandler(hasNextFaultPage, isFetchingNextFaultPage, fetchNextFaultPage);
    const handleDeviceScroll = createScrollHandler(hasNextDevicePage, isFetchingNextDevicePage, fetchNextDevicePage);

    const handleTabChange = useCallback(
        (value: string) => {
            const newTab = value as TabType;
            setActiveTab(newTab);

            if (newTab === "motorLogs") {
                setDeviceLogStatus(null);
                refetchDeviceLogs();
            } else if (newTab === "alertLogs") {
                refetchAlertLogs();
            } else if (newTab === "faultLogs") {
                refetchFaultLogs();
            }
        },
        [refetchDeviceLogs, refetchAlertLogs, refetchFaultLogs]
    );

    const handleStatusToggle = (value: string) => {
        setDeviceLogStatus(value === "all" ? null : (value as DeviceLogStatus));
    };

    useEffect(() => {
        if (activeTab === "motorLogs" && deviceLogStatus !== null) {
            refetchDeviceLogs();
        }
    }, [deviceLogStatus, activeTab, refetchDeviceLogs]);

    const deviceLogs = deviceData?.pages?.flatMap((page) => page?.data) || [];
    const alertLogs = alertLogsData?.pages?.flatMap((page) => page?.data) || [];
    const faultLogs = faultLogsData?.pages?.flatMap((page) => page?.data) || [];

    const tabs = [
        { value: "alertLogs", label: "Alerts" },
        { value: "faultLogs", label: "Faults" },
        { value: "motorLogs", label: "Logs" },
    ];

    return (
        <div className="h-full flex flex-col overflow-hidden rounded-lg">
            <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full h-full flex flex-col overflow-hidden "
            >
                <TabsList className="flex flex-row w-full justify-between items-center px-4   flex-shrink-0 gap-2">
                    <div className="flex gap-6 overflow-x-auto hide-scrollbar">
                        {tabs.map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className={`
                                    relative pb-2 text-sm font-medium transition-colors whitespace-nowrap
                                    ${activeTab === tab.value ? "text-green-600" : "text-gray-600"}
                                `}
                            >
                                {tab.label}
                                {activeTab === tab.value && (
                                    <span className="absolute left-0 right-0 bottom-1 border-b-2 border-green-600 h-[2px] bg-green-600 rounded" />
                                )}
                            </TabsTrigger>
                        ))}
                    </div>

                    {activeTab === "motorLogs" && (
                        <div className="flex-shrink-0">
                            <Select
                                value={deviceLogStatus === null ? "all" : deviceLogStatus}
                                onValueChange={handleStatusToggle}
                            >
                                <SelectTrigger className="w-18 px-3 h-7 text-xs  font-medium bg-white border border-gray-300 rounded-md focus:outline-none">
                                    <FilterIcon className="w-4 h-4 text-green-800 mr-1" />
                                    {deviceLogStatus === null ? "All" : capitalizeFirstLetter(deviceLogStatus)}
                                </SelectTrigger>
                                <SelectContent className="bg-white p-0 border min-w-10 text-xs w-full">
                                    {["all", "on", "off", "mode"].map((status) => (
                                        <SelectItem
                                            key={status}
                                            value={status}
                                            className={`text-xs ${(status === "all" && deviceLogStatus === null) ||
                                                deviceLogStatus === status
                                                ? "bg-green-200 hover:bg-green-100"
                                                : "hover:bg-green-100"
                                                }`}
                                        >
                                            {capitalizeFirstLetter(status)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </TabsList>

                <TabsContent value="alertLogs" className="flex-1 px-4 overflow-hidden flex flex-col min-h-0  !mt-0">
                    <div
                        ref={alertLogContainerRef}
                        onScroll={handleAlertScroll}
                        className="text-sm text-black flex-1 overflow-y-auto hide-scrollbar"
                    >
                        {isFetchingAlertLogs && alertLogs.length === 0 ? (
                            <LoadingSpinner message="Loading alert logs..." />
                        ) : !Array.isArray(alertLogs) || alertLogs.length === 0 ? (
                            <EmptyState message="No alert logs found." />
                        ) : (
                            <>
                                {alertLogs.map((log, index) => (
                                    <AlertLogItem key={log.id || index} log={log} index={index} />
                                ))}
                                {isFetchingNextAlertPage && <PaginationLoader />}
                            </>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="faultLogs" className="flex-1 px-4 overflow-hidden flex flex-col min-h-0 !mt-0">
                    <div
                        ref={faultLogContainerRef}
                        onScroll={handleFaultScroll}
                        className="text-sm text-black flex-1 overflow-y-auto hide-scrollbar"
                    >
                        {isFetchingFaultLogs && faultLogs.length === 0 ? (
                            <LoadingSpinner message="Loading fault logs..." />
                        ) : !Array.isArray(faultLogs) || faultLogs.length === 0 ? (
                            <EmptyState message="No fault logs found." />
                        ) : (
                            <>
                                {faultLogs.map((log, index) => (
                                    <FaultLogItem key={log.id || index} log={log} index={index} />
                                ))}
                                {isFetchingNextFaultPage && <PaginationLoader />}
                            </>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="motorLogs" className="flex-1 px-4 overflow-hidden flex flex-col min-h-0 !mt-0">
                    <div
                        ref={deviceLogContainerRef}
                        onScroll={handleDeviceScroll}
                        className="text-xs text-black flex-1 overflow-y-auto hide-scrollbar"
                    >
                        {isFetchingDeviceLogs && deviceLogs.length === 0 ? (
                            <LoadingSpinner message="Loading motor logs..." />
                        ) : !Array.isArray(deviceLogs) || deviceLogs.length === 0 ? (
                            <EmptyState message="No motor logs found." />
                        ) : (
                            <>
                                {deviceLogs.map((log, index) => (
                                    <MotorLogItem key={log.id || index} log={log} index={index} />
                                ))}
                                {isFetchingNextDevicePage && <PaginationLoader />}
                            </>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SinglePondLogs;