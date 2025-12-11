import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Outlet,
  useLocation,
  useParams,
  useRouter,
} from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NoDataMotors } from "src/components/svg/NoDataMotors";
import { NoDataPonds } from "src/components/svg/NoDataPonds";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "src/components/ui/accordion";
import {
  getUserBasedPondsAPI,
  getUserLogsDeviceAPI,
  getUserLogsPondsAPI,
} from "src/lib/services/users";
import { PondsSheetLogs } from "../core/PondsSheetLogs";
import Tabs from "../core/Tabs";
import { AlertIcon } from "../icons/stats/AlertIcon";
import { MotorOffIcon } from "../icons/stats/MotorOff";
import { MotorsCountIcon } from "../icons/stats/MotorsCount";
import { PowerOn } from "../icons/stats/PowerOn";

import { PondLocationIcon } from "../svg/PondLocationIcon";
import AlertPondLogs from "./AlertsPondsLogs";
import MotorImg from "../icons/users/ponds/MotorImage";
import DeviceImg from "../icons/users/ponds/DeviceImg";

const UserBasedPonds = () => {
  const router = useRouter();
  const { user_id, pond_id, motor_id } = useParams({ strict: false });
  const { search, pathname } = useLocation();
  const [deviceLogStatus, setDeviceLogStatus] = useState<
    "on" | "off" | "mode" | null
  >(null);
  const [activeTab, setActiveTab] = useState<"pondLogs" | "motorLogs">(
    "pondLogs"
  );
  const [initialTab, setInitialTab] = useState<"alertLogs" | "faultLogs">(
    "alertLogs"
  );
  const searchParams = new URLSearchParams(search);
  const locationId = searchParams.get("locationId") || "";
  const [searchString, setSearchString] = useState<string>(
    searchParams.get("search_pond") || ""
  );
  const [selectedIPv6, setSelectedIPv6] = useState<string | null>(null);
  const [debounceSearchString, setDebounceSearchString] = useState<string>(
    searchParams.get("locationId") || ""
  );
  const pondsObserver = useRef<IntersectionObserver | null>(null);
  const pondsLoadMoreRef = useRef<HTMLDivElement | null>(null);
  const pondsScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedPond, setSelectedPond] = useState<any>(null);
  const {
    isFetching: isFetchingPonds,
    data: pondsData,
    fetchNextPage: fetchNextPondsPage,
    hasNextPage: hasNextPondsPage,
    isFetchingNextPage: isFetchingNextPondsPage,
    refetch: refetchPonds,
  } = useInfiniteQuery({
    queryKey: ["ponds", user_id, debounceSearchString],
    queryFn: async ({ pageParam = 1 }) => {
      let queryParams: any = {
        page: pageParam,
        limit: 15,
      };
      if (debounceSearchString) {
        queryParams.search_pond = debounceSearchString;
      }
      const response = await getUserBasedPondsAPI(queryParams, user_id);
      const { data } = response?.data;
      return {
        data,
        records: data?.records || [],
        pagination: data?.pagination || null,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination) return undefined;
      const { current_page, total_pages } = lastPage.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    enabled: !!user_id,
    refetchOnWindowFocus: false,
  });
  const setupPondsObserver = useCallback(() => {
    if (isFetchingNextPondsPage || !hasNextPondsPage) return;
    if (pondsObserver.current) pondsObserver.current.disconnect();
    pondsObserver.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPondsPage &&
          !isFetchingNextPondsPage
        ) {
          fetchNextPondsPage();
        }
      },
      {
        root: pondsScrollContainerRef.current,
        rootMargin: "100px",
        threshold: 0.5,
      }
    );
    if (pondsLoadMoreRef.current) {
      pondsObserver.current.observe(pondsLoadMoreRef.current);
    }
    return () => {
      if (pondsObserver.current) {
        pondsObserver.current.disconnect();
      }
    };
  }, [hasNextPondsPage, fetchNextPondsPage, isFetchingNextPondsPage]);
  useEffect(() => {
    const cleanup = setupPondsObserver();
    return cleanup;
  }, [setupPondsObserver]);
  const {
    data: logsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchLogs,
    isFetching: isFetchingLogs,
  } = useInfiniteQuery({
    queryKey: ["pond-logs", pond_id],
    enabled: !!pond_id,
    queryFn: async ({ pageParam = 1 }) => {
      const queryParams = {
        page: pageParam,
        limit: 10,
      };
      const response = await getUserLogsPondsAPI(queryParams, pond_id);
      const data = response?.data?.data;
      const records = data?.records || [];
      const pagination = data?.pagination || null;
      return {
        data: records,
        pagination,
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

  const {
    data: deviceData,
    fetchNextPage: fetchNextDevicePage,
    hasNextPage: hasNextDevicePage,
    isFetchingNextPage: isFetchingNextDevicePage,
    refetch: refetchDeviceLogs,
    isFetching: isFetchingDeviceLogs,
  } = useInfiniteQuery({
    queryKey: ["device-logs", pond_id, deviceLogStatus],

    queryFn: async ({ pageParam = 1 }) => {
      const queryParams = {
        page: pageParam,
        limit: 10,
        ...(deviceLogStatus && { search_string: deviceLogStatus }),
      };

      const response = await getUserLogsDeviceAPI(queryParams, pond_id);
      const data = response?.data?.data;
      const records = data?.records || [];
      const pagination = data?.pagination || null;
      return {
        data: records,
        pagination,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination) return undefined;
      const { current_page, total_pages } = lastPage.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    enabled: false,
    refetchOnWindowFocus: false,
  });

  const handleCardClick = (pond_id: any, motor_id: any) => {
    router.navigate({
      to: `/users/${user_id}/ponds/${pond_id}/motors/${motor_id}`,
      search: { motor_id },
    });
  };

  const handleAlertClick = (
    motorId: string | null,
    pondTitle: string,
    tab: "alertLogs" | "faultLogs" = "alertLogs"
  ) => {
    if (!motorId) return;
    setSelectedPond({ id: motorId, title: pondTitle });
    setInitialTab(tab);
    setShowAlert(true);
  };

  const handlepondClick = (pond_id: any) => {
    const currentPath = pathname;
    const isMotorView = currentPath.includes("/motors/");
    const targetPath = isMotorView
      ? `/users/${user_id}/ponds/${pond_id}/motors/${motor_id}`
      : `/users/${user_id}/ponds/${pond_id}`;
    if (currentPath !== targetPath) {
      router.navigate({ to: targetPath });
    }
  };

  const handleDeviceClick = (device_ipv6: string) => {
    setSelectedIPv6(device_ipv6);
  };

  const handleStatusToggle = (value: "on" | "off" | "mode" | null) => {
    setDeviceLogStatus(value);
  };
  useEffect(() => {
    if (deviceLogStatus !== null) {
      refetchDeviceLogs();
    }
  }, [deviceLogStatus, refetchDeviceLogs]);

  const capitalize = (str: string) =>
    str?.replace(/\b\w/g, (char) => char.toUpperCase());
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceSearchString(searchString);
      router.navigate({
        to: pathname,
        search: (prev) => ({
          ...prev,
          search_pond: searchString || undefined,
          locationId: Number(locationId) || undefined,
        }),
      });
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchString, router, pathname, locationId]);

  const allPonds = useMemo(() => {
    return pondsData?.pages?.flatMap((page) => page.records) || [];
  }, [pondsData]);
  const filteredPonds = useMemo(() => {
    if (!locationId) return allPonds;
    return allPonds.filter((pond) => pond.location?.id === Number(locationId));
  }, [allPonds, locationId]);

  return (
    <div className="w-full flex bg-white overflow-y-auto border-l">
      <div className="w-custom_60per flex flex-col">
        <Tabs
          searchString={searchString}
          setSearchString={setSearchString}
          title="Search Ponds"
        />
        <div
          ref={pondsScrollContainerRef}
          className="h-device_graph overflow-auto border-green-500"
        >
          {isFetchingPonds && !pondsData ? (
            <div className="p-3 w-full h-full box-border flex flex-col items-center justify-center text-center text-gray-500">
              <img src="/PeepulAgriLogo.svg" alt="Logo" className="w-32 h-32" />
            </div>
          ) : filteredPonds.length > 0 ? (
            <div className="p-2 w-full flex">
              <div className="space-y-1 w-full">
                <Accordion
                  type="single"
                  collapsible
                  defaultValue={pond_id?.toString()}
                  className="bg-white space-y-2 w-full"
                >
                  {filteredPonds.map((pond: any) => (
                    <AccordionItem
                      key={pond?.id}
                      value={pond?.id.toString()}
                      className="border border-slate-200 rounded-lg data-[state=open]:border-[#05A155]"
                    >
                      <AccordionTrigger
                        className="text-base p-2 rounded-lg hover:bg-gray-50 w-full cursor-pointer hover:no-underline"
                        onClick={() => {
                          router.navigate({
                            to: `/users/${user_id}/ponds/${pond?.id}`,
                            search: (prev: any) => ({ ...prev }),
                          });
                        }}
                      >
                        <div className="flex w-full items-center gap-3">
                          <div className="w-custom_40per font-medium text-4B4B4B text-xs 3xl:text-base text-left">
                            {pond?.title ? (
                              pond?.title.length > 10 ? (
                                <span title={capitalize(pond?.title)}>
                                  {capitalize(pond?.title.slice(0, 10)) + "..."}
                                </span>
                              ) : (
                                capitalize(pond?.title)
                              )
                            ) : (
                              "-"
                            )}
                          </div>
                          <div className="w-custom_40per flex items-center gap-1 text-xs 3xl:text-sm">
                            <PondLocationIcon />
                            <div className="text-505F79 font-medium w-full truncate">
                              {pond?.location?.title ? (
                                pond?.location?.title.length > 10 ? (
                                  <span
                                    title={capitalize(pond?.location?.title)}
                                  >
                                    {capitalize(
                                      pond?.location?.title.slice(0, 10)
                                    ) + "..."}
                                  </span>
                                ) : (
                                  capitalize(pond?.location?.title)
                                )
                              ) : (
                                "-"
                              )}
                            </div>
                          </div>
                          <div className="w-custom_20per flex items-center gap-1">
                            <MotorsCountIcon className="size-4" />
                            <div className="bg-1D2943/20 h-4 w-5 text-[11px] text-1D2943 3xl:text-sm rounded-sm flex items-center justify-center">
                              {pond?.total_motors_count
                                ? pond?.total_motors_count
                                : 0}
                            </div>
                          </div>
                          <div className="w-custom_20per flex items-center gap-1">
                            <PowerOn className="size-4" />
                            <div className="bg-1D2943/20 h-4 w-5 text-[11px] text-1D2943 3xl:text-sm rounded-sm flex items-center justify-center">
                              {pond?.power_on_count ? pond?.power_on_count : 0}
                            </div>
                          </div>
                          <div className="w-custom_25per flex items-center gap-1">
                            <img
                              src="/assets/Fan animation.svg"
                              alt="Motor on icon"
                              className="size-7"
                            />
                            <div className="bg-1D2943/20 h-4 w-5 text-[11px] text-1D2943 3xl:text-sm rounded-sm flex items-center justify-center">
                              {pond?.motors_on_count
                                ? pond?.motors_on_count
                                : 0}
                            </div>
                          </div>
                          <div className="w-custom_25per flex items-center gap-1">
                            <MotorOffIcon className="size-7" />
                            <div className="bg-1D2943/20 h-4 w-5 text-[11px] text-1D2943 3xl:text-sm rounded-sm flex items-center justify-center">
                              {pond?.motors_off_count
                                ? pond?.motors_off_count
                                : 0}
                            </div>
                          </div>
                          <div className="w-custom_25per flex items-center gap-1">
                            <AlertIcon className="size-8 text-red-500" />
                            <div className="bg-1D2943/20 h-4 w-5 text-[11px] text-1D2943 3xl:text-sm rounded-sm flex items-center justify-center">
                              {pond?.alert_count ? pond?.alert_count : 0}
                            </div>
                          </div>
                          <div className="w-custom_20per flex items-center gap-1">
                            <span className="text-gray-400 text-xs">M</span>
                            <div className="bg-1D2943/20 h-4 w-5 text-[11px] text-1D2943 3xl:text-sm rounded-sm flex items-center justify-center">
                              {pond?.manual_count ? pond?.manual_count : 0}
                            </div>
                          </div>
                          <div className="w-custom_20per flex items-center gap-1">
                            <span className="text-gray-400 text-xs">A</span>
                            <div className="bg-1D2943/20 h-4 w-5 text-[11px] text-1D2943 3xl:text-sm rounded-sm flex items-center justify-center">
                              {pond?.auto_count ? pond?.auto_count : 0}
                            </div>
                          </div>

                          <div
                            className="w-3/12 flex items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <PondsSheetLogs
                              refetch={refetchLogs}
                              pondTitle={pond?.title}
                              pond={pond}
                              pondId={pond?.id}
                              ipv6={pond?.motors?.[0]?.starterBox?.ipv6}
                              logs={
                                logsData?.pages?.flatMap(
                                  (page) => page?.data
                                ) || []
                              }
                              devicelogs={
                                deviceData?.pages?.flatMap(
                                  (page) => page?.data
                                ) || []
                              }
                              refetchDeviceLogs={refetchDeviceLogs}
                              handleDeviceClick={handleDeviceClick}
                              handlepondClick={handlepondClick}
                              isLoading={isFetchingLogs}
                              isLoadingDevice={isFetchingDeviceLogs}
                              fetchNextPage={fetchNextPage}
                              hasNextPage={hasNextPage}
                              isFetchingNextPage={isFetchingNextPage}
                              fetchNextDevicePage={fetchNextDevicePage}
                              hasNextDevicePage={hasNextDevicePage}
                              isFetchingNextDevicePage={
                                isFetchingNextDevicePage
                              }
                              deviceLogStatus={deviceLogStatus}
                              handleStatusToggle={handleStatusToggle}
                            />
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-0 overflow-hidden rounded-b-lg">
                        {pond?.motorCount === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            <div className="flex justify-center">
                              <NoDataMotors />
                            </div>
                            No motors available
                          </div>
                        ) : (
                          <div>
                            <table className="w-full text-xs 3xl:text-sm">
                              <thead className="bg-gray-100 text-7F899D">
                                <tr className="font-inter">
                                  <th className="p-2 text-left font-medium text-7F899D text-xs 3xl:text-sm">
                                    Motors
                                  </th>
                                  <th className="p-2 text-left font-medium text-7F899D text-xs 3xl:text-sm">
                                    Connected Devices
                                  </th>
                                  <th className="p-2 text-left font-medium text-7F899D text-xs 3xl:text-sm">
                                    State
                                  </th>
                                  <th className="p-2 text-center font-medium text-7F899D text-xs 3xl:text-sm">
                                    Mode
                                  </th>
                                  <th className="p-2 text-center font-medium text-7F899D text-xs 3xl:text-sm">
                                    Volts(V)
                                  </th>
                                  <th className="p-2 text-center font-medium text-7F899D text-xs 3xl:text-sm">
                                    Current(A)
                                  </th>

                                  <th className="p-2 text-center font-medium text-7F899D text-xs 3xl:text-sm">
                                    Alerts
                                  </th>
                                  <th className="p-2 text-center font-medium text-7F899D text-xs 3xl:text-sm">
                                    Faults
                                  </th>
                                  {/* <th className="p-2 text-left font-medium text-7F899D text-xs 3xl:text-sm">
                                    Actions
                                  </th> */}
                                </tr>
                              </thead>
                              <tbody>
                                {pond?.motors.map((motor: any) => (
                                  <tr
                                    onClick={() => {
                                      handleCardClick(pond.id, motor.id);
                                    }}
                                    key={motor?.id}
                                    className={`border-b border-gray-200 ${motor_id == motor?.id ? "bg-E4F5E3" : "hover:bg-gray-50"} cursor-pointer`}
                                  >
                                    <td className="px-2 py-1">
                                      {motor?.title ? (
                                        <span className="flex items-center gap-2">
                                          <MotorImg className="size-4" />
                                          <span title={motor?.title}>
                                            {motor?.title.length > 13
                                              ? capitalize(
                                                motor?.title.slice(0, 10)
                                              ) + "..."
                                              : capitalize(motor?.title)}
                                            <div className="flex items-center gap-2">
                                              {motor?.starterBox?.status ===
                                                "ACTIVE" ? (
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_4px_2px_rgba(34,197,94,0.4)]"></div>
                                              ) : (
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_2px_1px_rgba(239,68,68,0.4)]"></div>
                                              )}

                                              <span className="block text-xxs 3xl:text-xs">
                                                {motor?.hp ? motor?.hp : "-"}{" "}
                                                {motor?.hp ? "HP" : ""}
                                              </span>
                                            </div>
                                          </span>
                                        </span>
                                      ) : (
                                        "--"
                                      )}
                                    </td>
                                    <td className="px-2 py-1">
                                      <span className="flex items-center gap-1">
                                        {motor?.starterBox?.title ? (
                                          <>
                                            <DeviceImg className="size-4" />
                                            <span
                                              title={motor?.starterBox?.title}
                                            >
                                              {motor?.starterBox?.title.length >
                                                15
                                                ? capitalize(
                                                  motor?.starterBox?.title.slice(
                                                    0,
                                                    10
                                                  )
                                                ) + "..."
                                                : capitalize(
                                                  motor?.starterBox?.title
                                                )}
                                            </span>
                                          </>
                                        ) : (
                                          "--"
                                        )}
                                      </span>
                                    </td>
                                    <td
                                      className={`px-2 py-1 ${motor?.state === 0 ? "text-red-400" : "text-green-400"}`}
                                    >
                                      <div
                                        className={`flex items-center justify-center font-normal text-xs 3xl:text-sm gap-1 ${motor?.state === 0 ? "text-red-500" : "text-green-500"}`}
                                      >
                                        {motor?.state === 0 ? "OFF" : "ON"}
                                      </div>
                                    </td>
                                    <td className="px-2 py-1">
                                      <span className="flex items-center gap-1">
                                        {motor?.mode
                                          ? capitalize(motor.mode.toLowerCase())
                                          : "--"}
                                      </span>
                                    </td>

                                    <td className="px-2 py-1">
                                      <span className="flex items-center gap-3 justify-center">
                                        {motor?.starterBoxFaults?.length > 0 &&
                                          motor?.starterBoxFaults[0] ? (
                                          <>
                                            <span className="text-red-500 ">
                                              {motor.starterBoxFaults[0]
                                                .line_voltage_vry ?? "--"}{" "}
                                            </span>
                                            <span className="text-yellow-500">
                                              {motor.starterBoxFaults[0]
                                                .line_voltage_vyb ?? "--"}{" "}
                                            </span>
                                            <span className="text-blue-500">
                                              {motor.starterBoxFaults[0]
                                                .line_voltage_vbr ?? "--"}{" "}
                                            </span>
                                          </>
                                        ) : (
                                          <span>--</span>
                                        )}
                                      </span>
                                    </td>
                                    <td className="px-2 py-1">
                                      <span className="flex items-center gap-3 justify-center">
                                        {motor?.starterBoxFaults?.length > 0 &&
                                          motor?.starterBoxFaults[0] ? (
                                          <>
                                            <span className="text-red-500">
                                              {motor.starterBoxFaults[0]
                                                .current_i1 ?? "--"}{" "}
                                            </span>
                                            <span className="text-yellow-500">
                                              {motor.starterBoxFaults[0]
                                                .current_i2 ?? "--"}{" "}
                                            </span>
                                            <span className="text-blue-500">
                                              {motor.starterBoxFaults[0]
                                                .current_i3 ?? "--"}{" "}
                                            </span>
                                          </>
                                        ) : (
                                          <span>--</span>
                                        )}
                                      </span>
                                    </td>

                                    <td className="px-2 py-1">
                                      <a
                                        href="#"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAlertClick(
                                            motor.id,
                                            pond.title,
                                            "alertLogs"
                                          );
                                        }}
                                        className="flex items-center gap-1 justify-center text-7F899D hover:underline"
                                      >
                                        {motor.motor_alert_count ?? "--"}
                                      </a>
                                    </td>
                                    <td className="px-2 py-1">
                                      <a
                                        href="#"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAlertClick(
                                            motor.id,
                                            pond.title,
                                            "faultLogs"
                                          );
                                        }}
                                        className="flex items-center gap-1 justify-center text-7F899D hover:underline"
                                      >
                                        {motor.motor_fault_count ?? "--"}
                                      </a>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                <div
                  ref={pondsLoadMoreRef}
                  className="h-16 flex justify-center items-center"
                >
                  {isFetchingNextPondsPage && (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 w-full h-full box-border flex flex-col items-center justify-center text-center text-gray-500">
              <NoDataPonds />
              <p className="font-medium">No ponds found</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-custom_40per p-3 box-border h-device_graph_1 overflow-auto border-l">
        <Outlet />
        {showAlert && selectedPond.id && (
          <AlertPondLogs
            motorId={selectedPond.id}
            open={showAlert}
            setOpen={setShowAlert}
            initialTab={initialTab}
          />
        )}
      </div>
    </div>
  );
};

export default UserBasedPonds;
