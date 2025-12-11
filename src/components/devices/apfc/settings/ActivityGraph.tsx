import React, { useEffect, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Button } from "src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import {
  getDeviceDataWithMinuteParamatersAPI,
  updateSyncDeviceParamsAPI,
} from "src/lib/services/apfc";
import { useNavigate, useParams } from "@tanstack/react-router";
import { X } from "lucide-react";
import CustomDateRangePicker from "src/components/core/CustomDateRangePicker";
import LoadingComponent from "src/components/core/Loading";
import DeviceDetailsIcon from "src/components/icons/apfc/DeviceDetaills";
import ActivityIcon from "src/components/icons/apfc/ActivityIcon";
import RefreshIcon from "src/components/icons/apfc/Refresh";
import { parameters } from "src/lib/constants/apfcSettingsConstants";

interface DataPoint {
  timestamp: string;
  total_kw?: number;
  average_pf?: number;
  kwh?: number;
  kvah?: number;
}

interface CombinedDataPoint {
  timestamp: string;
  [key: string]: number | string;
}

const ActivityGraph: React.FC = () => {
  const navigate = useNavigate();
  const { apfc_id, user_id } = useParams({ strict: false });
  const queryClient = useQueryClient();
  const isDetailsActive = location.pathname.includes("/details");
  const isSettingsActive = location.pathname.includes("/settings");
  const isActivityActive = location.pathname.includes("/activity");

  const today = new Date();
  const [dateRange, setDateRange] = useState<[Date, Date] | null>([
    today,
    today,
  ]);
  const [selectedParams, setSelectedParams] = useState<string[]>([
    "total_kw",
    "average_pf",
  ]);
  const [zoomedData, setZoomedData] = useState<CombinedDataPoint[]>([]);
  const [interval, setInterval] = useState<number | undefined>(undefined);

  const fetchData = async (fromDate: string, toDate: string) => {
    const promises = selectedParams.map((param) =>
      getDeviceDataWithMinuteParamatersAPI(apfc_id, {
        parameter: param,
        from_date: fromDate,
        to_date: toDate,
      })
    );

    const results = await Promise.allSettled(promises);
    const combinedData: CombinedDataPoint[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const seriesData: DataPoint[] = result.value.data?.data;
        seriesData.forEach((item: any) => {
          const timestamp = new Date(item.timestamp).toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          });
          const existingPoint = combinedData.find(
            (d) => d.timestamp === timestamp
          );
          if (existingPoint) {
            existingPoint[selectedParams[index]] =
              Number(item[selectedParams[index]]) || 0;
          } else {
            const newPoint: CombinedDataPoint = { timestamp };
            newPoint[selectedParams[index]] =
              Number(item[selectedParams[index]]) || 0;
            combinedData.push(newPoint);
          }
        });
      } else {
        console.error(
          `Failed to fetch data for ${selectedParams[index]}:`,
          result.reason
        );
      }
    });

    return combinedData.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["graphData", apfc_id, dateRange, selectedParams],
    queryFn: () => {
      if (dateRange) {
        return fetchData(
          dayjs(dateRange[0]).toISOString(),
          dayjs(dateRange[1]).toISOString()
        );
      }
      return [];
    },
    enabled: !!dateRange,
  });

  const updateSyncMutation = useMutation({
    mutationFn: () => updateSyncDeviceParamsAPI(apfc_id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["graphData", apfc_id, dateRange, selectedParams],
      });
      refetch();
    },
    onError: (err) => {
      console.error("Sync API error:", err);
    },
  });
  useEffect(() => {
    if (data) {
      setZoomedData(data);
    }
  }, [data]);

  useEffect(() => {
    refetch();
  }, [dateRange, selectedParams, refetch]);

  const handleParamsChange = (paramValue: string) => {
    setSelectedParams((prev) =>
      prev.includes(paramValue)
        ? prev.filter((p) => p !== paramValue)
        : [...prev, paramValue]
    );
  };

  const handleDetailsClick = () => {
    location.pathname.includes("/users")
      ? navigate({ to: `/users/${user_id}/apfc/${apfc_id}/details` })
      : navigate({ to: `/apfc/${apfc_id}/details` });
  };

  const handleSettingsClick = () => {
    location.pathname.includes("/users")
      ? navigate({
          to: `/users/${user_id}/apfc/${apfc_id}/settings?state=Level1`,
        })
      : navigate({ to: `/apfc/${apfc_id}/settings?state=Level1` });
  };

  const handleActivityClick = () => {
    location.pathname.includes("/users")
      ? navigate({ to: `/users/${user_id}/apfc/${apfc_id}/activity` })
      : navigate({ to: `/apfc/${apfc_id}/activity` });
  };

  const handleDateRangeChange = useCallback((value: [Date, Date] | null) => {
    setDateRange(value);
  }, []);
  const calculateXAxisInterval = (
    chartWidth: number,
    zoomedDataLength: number
  ) => {
    const maxTicks = Math.floor(chartWidth / 100);
    const effectiveLength = Math.min(zoomedDataLength, maxTicks);

    if (effectiveLength <= 10) return 1;
    if (effectiveLength <= 30) return 1;
    if (effectiveLength <= 100) return 2;
    return 5;
  };

  const handleZoomChange = async (newRange: any) => {
    if (
      newRange &&
      newRange.startIndex !== undefined &&
      newRange.endIndex !== undefined
    ) {
      const startIndex = newRange.startIndex;
      const endIndex = newRange.endIndex;
      const chartWidth = 1300;
      const intervalValue = calculateXAxisInterval(
        chartWidth,
        endIndex - startIndex + 1
      );
      setInterval(intervalValue);

      if (data && data.length > 0) {
        const startTimestamp = data[startIndex]?.timestamp;
        const endTimestamp = data[endIndex]?.timestamp;

        if (startTimestamp && endTimestamp) {
          const start = new Date(startTimestamp).getTime();
          const end = new Date(endTimestamp).getTime();

          if (!isNaN(start) && !isNaN(end) && start < end) {
            const newData = await fetchData(
              new Date(start).toISOString(),
              new Date(end).toISOString()
            );
            setZoomedData(newData);
          }
        }
      }
    }
  };

  return (
    <div className="bg-white w-full max-w-full rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button
            className={`flex items-center gap-2 rounded-full py-2 px-4 text-teal-600 font-inter text-xs font-medium ${isDetailsActive ? "bg-teal-100" : "bg-transparent"} hover:bg-teal-100`}
            onClick={handleDetailsClick}
          >
            <DeviceDetailsIcon className="w-6 h-6" />
            Device Details
          </Button>
          <Button
            className={`flex items-center gap-2 rounded-full py-2 px-4 text-teal-600 font-inter text-xs font-medium ${isSettingsActive ? "bg-teal-100" : "bg-transparent"} hover:bg-teal-100`}
            onClick={handleSettingsClick}
          >
            <DeviceDetailsIcon className="w-6 h-6" />
            Device Settings
          </Button>
          <Button
            className={`flex items-center gap-2 rounded-full py-2 px-4 text-teal-600 font-inter text-xs font-medium ${isActivityActive ? "bg-teal-100" : "bg-transparent"} hover:bg-teal-100`}
            onClick={handleActivityClick}
          >
            <ActivityIcon className="w-6 h-6" />
            Activity
          </Button>
        </div>
        <Button
          onClick={() => updateSyncMutation.mutate()}
          disabled={updateSyncMutation.isPending}
          className="rounded-lg bg-transparent hover:bg-gray-100 border border-gray-300 text-gray-700 font-inter text-xs px-3 py-1"
        >
          <RefreshIcon className="w-3 h-3 mr-1" />
          {updateSyncMutation.isPending ? "Updating..." : "Update Sync"}
        </Button>
      </div>
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ActivityIcon className="w-4 h-4" />
            <h2 className="text-base font-normal font-inter">Activity Graph</h2>
          </div>
          <div className="flex gap-4 items-center">
            <DropdownMenu>
              <div className="relative w-56">
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-xs 3xl:text-smd py-0 h-9"
                  >
                    <span className="truncate">
                      {selectedParams.length > 0
                        ? selectedParams
                            .map(
                              (param) =>
                                parameters.find((p) => p.value === param)?.title
                            )
                            .join(", ")
                        : "Select parameters"}
                    </span>
                    <span>▼</span>
                  </Button>
                </DropdownMenuTrigger>
                {selectedParams.length > 0 && (
                  <X
                    className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 hover:text-red-500 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedParams([]);
                    }}
                  />
                )}
              </div>
              <DropdownMenuContent className="w-48 ">
                {parameters.map((param) => (
                  <DropdownMenuCheckboxItem
                    className="text-smd 3xl:text-md font-normal"
                    key={param.value}
                    checked={selectedParams.includes(param.value)}
                    onCheckedChange={() => handleParamsChange(param.value)}
                  >
                    {param.title}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <CustomDateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
            />
          </div>
        </div>
        <div className="max-w-full overflow-hidden">
          {isLoading ? (
            <LoadingComponent loading={isLoading} message="Loading..." />
          ) : data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(timestamp) =>
                    new Date(timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  }
                  interval={interval} // Apply dynamic interval
                  angle={-45} // Add angle for better readability
                  textAnchor="end"
                />
                <YAxis yAxisId="primary" />
                <YAxis
                  yAxisId="secondary"
                  orientation="right"
                  label={{
                    value: "Average PF",
                    angle: 90,
                    position: "insideRight",
                  }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const param: any = parameters.find(
                      (p: any) => p.value === name
                    );
                    return [
                      `${value.toFixed(2)} ${param?.unit || ""}`,
                      param?.title || name,
                    ];
                  }}
                  labelFormatter={(label) =>
                    dayjs(label).format("MM/DD/YYYY, HH:mm:ss A")
                  }
                />
                <Legend />
                {selectedParams.map((param) => {
                  const parameter = parameters.find((p) => p.value === param);
                  return (
                    <Line
                      key={param}
                      type="monotone"
                      dataKey={param}
                      stroke={parameter?.color}
                      name={parameter?.title}
                      fill={parameter?.color}
                      yAxisId={param === "average_pf" ? "secondary" : "primary"}
                    />
                  );
                })}
                <Brush
                  dataKey="timestamp"
                  height={30}
                  stroke="#8884d8"
                  travellerWidth={10}
                  gap={5}
                  tickFormatter={(timestamp) =>
                    new Date(timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  }
                  onChange={handleZoomChange}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-96">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityGraph;
