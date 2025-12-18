import { capitalize } from "@/lib/helpers/capitalize";
import { getColorFromMotorIdInGraph } from "@/lib/helpers/map/randomizeColors";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import { DateRangePicker } from "rsuite";
import "rsuite/dist/rsuite.css";
import {
  getEmptyMotorGraphAPI,
  getMultipleMotorsGraphAPI,
  getRunTimeGraphAPI,
  getRunTimeGraphCountAPI,
  getVoltageGraphAPI,
} from "src/lib/services/deviceses";
import CustomDateCalendar from "./customDateCalendar";
import { ClockIcon } from "./svg/ClockIcon";
import { MeterIcon } from "./svg/MeterIcon";
import { ThunderIcon } from "./svg/ThunderIcon";

dayjs.extend(utc);
dayjs.extend(timezone);

const getDefaultRange = () => {
  const from = dayjs().subtract(1, "day").startOf("day").toDate();
  const to = dayjs().endOf("day").toDate();
  return { from, to };
};

const HighCharts: FC<any> = (props: any) => {
  const { afterToday } = DateRangePicker;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isDashboardRoute = location.pathname.includes("/devices");

  const isDeviceGraph =
    location.pathname.includes("/mtr_1") ||
    location.pathname.includes("/mtr_2") 
    

  const {
    motorData,
    paramater,
    starterId,
    dateValue,
    setDateValue,
    dateRange,
    setDateRange,
    userMotorsData,
    noMotors,
    motor_ref_id,
    selectedMotorsPayload,
    hideDatePicker,
    isMultipleMotorsSelected,
    date,
    setDate,
  } = props;

  const hasInitializedRef = useRef(false);


useEffect(() => {
  if (!hasInitializedRef.current && !date) {
    setDate(getDefaultRange());
    hasInitializedRef.current = true;
  } 
}, [date, setDate]);


  const memoizedMotorData = useMemo(
    () => ({
      starter_id: motorData?.starter_id || starterId,
      motor_id: motorData?.motor_id || motorData?.id || motor_ref_id || "mtr_1",
      motor_ref_id: motor_ref_id || motorData?.motor_ref_id || "mtr_1",
    }),
    [
      motorData?.starter_id,
      starterId,
      motorData?.motor_id,
      motorData?.id,
      motorData?.motor_ref_id,
      motor_ref_id,
    ]
  );
  const prevMotorIdRef = useRef(memoizedMotorData.motor_id);

  // const updateDateValues = useCallback(
  //   (newDate: any) => {
  //     if (
  //       Array.isArray(newDate) &&
  //       newDate.length === 2 &&
  //       newDate[0] &&
  //       newDate[1]
  //     ) {
  //       const fromDate = dayjs(newDate[0]).format("YYYY-MM-DD");
  //       const toDate = dayjs(newDate[1]).format("YYYY-MM-DD");
  //       setDateValue(newDate);
  //       setDateRange({ from_date: fromDate, to_date: toDate });
  //     } else {
  //       setDateValue([]);
  //       setDateRange(null);
  //     }
  //   },
  //   [setDateValue, setDateRange]
  // );

  const { data: durationCount } = useQuery({
    queryKey: [
      "durationCount",
      date?.from,
      date?.to,
      memoizedMotorData?.motor_id,
      memoizedMotorData?.motor_ref_id,
    ],
    queryFn: async () => {
      if (!date?.from || !date?.to) {
        return null;
      }
      const queryParams = {
        from_date: date?.from
          ? dayjs(date?.from).format("YYYY-MM-DD")
          : undefined,
        to_date: date?.to ? dayjs(date?.to).format("YYYY-MM-DD") : undefined,
      };

      const response = await getRunTimeGraphCountAPI({
        motor_id: memoizedMotorData.motor_id,
        queryParams,
      });

      return response?.data?.data?.total_runtime_hours;
    },
    enabled:
      !isDeviceGraph &&
      !!memoizedMotorData.motor_id &&
      !!date?.from &&
      !!date?.to,
  });

  const fetchGraphData = useCallback(async () => {
    if (!date?.from || !date?.to) {
      return null;
    }
    const queryParams = {
      from_date: date?.from
        ? dayjs(date?.from).format("YYYY-MM-DD")
        : undefined,
      to_date: date?.to ? dayjs(date?.to).format("YYYY-MM-DD") : undefined,
    };

    try {
      let response;

      // Handle runtime parameter separately (doesn't support multiple motors)
      if (
        paramater === "runtime" &&
        selectedMotorsPayload == null &&
        !isDeviceGraph
      ) {
        response = await getRunTimeGraphAPI({
          motor_id: memoizedMotorData.motor_id,
          queryParams,
        });
        return {
          run_Time_data: response?.data?.data?.run_Time_data || [],
          off_line_periods: response?.data?.data?.off_line_periods || [],
        };
      }

      // Handle empty/placeholder motors
      if (
        noMotors ||
        memoizedMotorData.motor_id === "mtr_1" ||
        memoizedMotorData.motor_id === "mtr_2"
      ) {
        response = await getEmptyMotorGraphAPI({
          starter_id: memoizedMotorData.starter_id,
          motor_id: memoizedMotorData.motor_ref_id,
          queryParams,
        });
        return response?.data?.data || [];
      }

      // Handle multiple motors (voltage/current)
      if (
        selectedMotorsPayload &&
        Array.isArray(selectedMotorsPayload) &&
        selectedMotorsPayload.length > 1
      ) {
        response = await getMultipleMotorsGraphAPI({
          payload: selectedMotorsPayload,
          queryParams,
        });
        return response?.data?.data || [];
      }

      // Handle single motor (voltage/current)
      if (memoizedMotorData?.starter_id) {
        response = await getVoltageGraphAPI({
          starter_id: memoizedMotorData.starter_id,
          motor_id: memoizedMotorData.motor_id,
          queryParams,
        });

        return response?.data?.data || [];
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching graph data:", error);
      throw error;
    }
  }, [
    memoizedMotorData.starter_id,
    memoizedMotorData.motor_id,
    memoizedMotorData.motor_ref_id,
    paramater,
    date?.from,
    date?.to,
    noMotors,
    selectedMotorsPayload,
    isMultipleMotorsSelected,
    isDeviceGraph,
  ]);

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "graph-data",
      paramater,
      memoizedMotorData.starter_id,
      memoizedMotorData.motor_id,
      date?.from ,
      date?.to ,
      selectedMotorsPayload,
      isMultipleMotorsSelected,
    ],
    queryFn: fetchGraphData,
    enabled:
      (!!memoizedMotorData.starter_id &&
        !!memoizedMotorData.motor_id &&
        !!date?.from &&
        !!date?.to) ||
      isMultipleMotorsSelected,
    retry: false,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const processMultipleMotorsData = (data: any[], parameter: string) => {
    if (!Array.isArray(data) || data.length === 0) {
      return { categories: [], series: [] };
    }

    const isMultipleMotors = data[0]?.motor_id && data[0]?.parameters;
    if (!isMultipleMotors) {
      return null;
    }

    const allTimestamps = new Set<string>();
    data.forEach((motor) => {
      motor.parameters?.forEach((param: any) => {
        allTimestamps.add(param.time_stamp);
      });
    });

    const sortedTimestamps = Array.from(allTimestamps).sort();
    const categories = sortedTimestamps.map((ts) =>
      dayjs.utc(ts).tz("Asia/Kolkata").format("HH:mm")
    );

    const series: any[] = [];
    data.forEach((motor, motorIndex) => {
      const motorTitle = motor.motor_title || `Motor ${motorIndex + 1}`;
      const color = getColorFromMotorIdInGraph(motor.motor_id);

      const dataMap = new Map();
      motor.parameters?.forEach((param: any) => {
        dataMap.set(param.time_stamp, param);
      });
      if (parameter === "voltage") {
        const voltageData = sortedTimestamps.map((ts) => {
          const param = dataMap.get(ts);
          return param ? parseFloat(param.avg_voltage) : null;
        });

        series.push({
          name: motorTitle,
          color,
          data: voltageData,
          marker: { symbol: "circle" },
        });
      } else if (parameter === "current") {
        const currentData = sortedTimestamps.map((ts) => {
          const param = dataMap.get(ts);
          return param ? parseFloat(param.avg_current) : null;
        });

        series.push({
          name: motorTitle,
          color,
          data: currentData,
          marker: { symbol: "circle" },
        });
      }
    });
    return { categories, series, timestamps: sortedTimestamps };
  };

  const chartOptions = useMemo(() => {
    if (paramater === "runtime") {
      const runtimeData = Array.isArray(data)
        ? data
        : data?.run_Time_data || [];
      const offlinePeriods = data?.off_line_periods || [];

      return {
        chart: {
          type: "line",
          height: 150,
          backgroundColor: "transparent",
          zooming: {
            type: "x",
            mouseWheel: {
              enabled: true,
              type: "x",
              sensitivity: 0.6,
            },
            spacingBottom: 5,
          },
          events: {
            load: function (this: any) {
              const chart = this;
              chart.container.addEventListener(
                "wheel",
                function (event: WheelEvent) {
                  event.preventDefault();
                  const zoomFactor = 0.1;
                  const delta = event.deltaY < 0 ? -1 : 1;
                  const xAxis = chart.xAxis[0];
                  if (!xAxis) return;
                  const normalizedEvent = chart.pointer.normalize(event);
                  const pointerX = xAxis.toValue(normalizedEvent.chartX);

                  const extremes = xAxis.getExtremes();
                  const min = extremes.min;
                  const max = extremes.max;
                  const oldRange = max - min;
                  const fraction = (pointerX - min) / oldRange;
                  const zoomMultiplier = 1 + zoomFactor * delta;
                  const newRange = Math.max(1, oldRange * zoomMultiplier);
                  let newMin = pointerX - fraction * newRange;
                  let newMax = newMin + newRange;
                  if (newMin < extremes.dataMin) {
                    newMin = extremes.dataMin;
                    newMax = newMin + newRange;
                  }
                  if (newMax > extremes.dataMax) {
                    newMax = extremes.dataMax;
                    newMin = newMax - newRange;
                  }
                  newMin = Math.max(extremes.dataMin, newMin);
                  newMax = Math.min(extremes.dataMax, newMax);

                  xAxis.setExtremes(newMin, newMax, true);
                  chart.redraw();
                }
              );
            },
          },
        },
        title: { text: "" },
        legend: {
          enabled: true,
          itemMarginTop: 2,
          itemMarginBottom: 2,
          symbolPadding: 3,
          itemStyle: {
            fontSize: "10px",
            cursor: "pointer",
          },
          itemHoverStyle: {
            cursor: "pointer",
          },
        },
        xAxis: {
          lineWidth: 1,
          lineColor: "#BFC1C6",
          tickWidth: 0,
          labels: {
            style: { fontSize: "10px" },
            rotation: -45,
            formatter: function (this: any) {
              return dayjs(this.value).tz("Asia/Kolkata").format("DD:MM:YYYY");
            },
          },
          title: { text: "Time" },
          rotation: -45,
          minRange: 1,
        },
        yAxis: {
          visible: false,
          min: 0,
          max: 4,
        },
        credits: { enabled: false },
        plotOptions: {
          series: {
            lineWidth: 3,
            events: {
              legendItemClick: function (this: any) {
                return true;
              },
            },
          },
          line: {
            step: "left",
            marker: {
              enabled: true,
              radius: 5,
              symbol: "circle",
            },
          },
        },
        tooltip: {
          shared: false,
          useHTML: true,
          formatter: function (this: any) {
            const point = this.point;
            const record = point.record;
            const offlineRecord = point.offlineRecord;

            if (offlineRecord) {
              const startTime = dayjs
                .utc(offlineRecord.start)
                .tz("Asia/Kolkata")
                .format("HH:mm:ss");
              const endTime = offlineRecord.ongoing
                ? "Ongoing"
                : dayjs
                    .utc(offlineRecord.end)
                    .tz("Asia/Kolkata")
                    .format("HH:mm:ss");

              const duration = offlineRecord.duration_mins || "N/A";

              return `
                <div style="font-size: 10px;">
                  <div style="font-weight: bold; color: #6b7280;">OFFLINE</div>
                  <div>Start: ${startTime}</div>
                  <div>End: ${endTime}</div>
                  <div>Duration: ${duration}</div>
                </div>`;
            }

            const startTime = dayjs
              .utc(record.start_time)
              .tz("Asia/Kolkata")
              .format("HH:mm:ss");
            const endTime = dayjs
              .utc(record.end_time)
              .tz("Asia/Kolkata")
              .format("HH:mm:ss");

            const state =
              record.motor_description ||
              (record.motor_state === 1
                ? "ON"
                : record.motor_state === 0
                  ? "OFF"
                  : "Neutral");

            const duration = record.duration || "N/A";

            return `
          <div style="font-size: 10px;">
            <div style="font-weight: bold; color: ${record.motor_state === 1 ? "#16A34A" : "#FF0000"};">${state}</div>
            <div>Start: ${startTime}</div>
            <div>End: ${endTime}</div>
            <div>Duration: ${duration}</div>
          </div>`;
          },
        },

        series: (() => {
          const seriesData: any = [];

          if (!Array.isArray(runtimeData) || runtimeData.length === 0) {
            return seriesData;
          }

          const segments: any[] = [];

          const offlinePeriods = (data?.off_line_periods || []).map(
            (period: any) => ({
              start: dayjs.utc(period.start).valueOf(),
              end: period.ongoing
                ? dayjs.utc().valueOf()
                : dayjs.utc(period.end).valueOf(),
              record: period,
            })
          );

          offlinePeriods.forEach((offline: any) => {
            const duration = offline.end - offline.start;
            segments.push({
              start: offline.start,
              end: offline.end,
              type: "OFFLINE",
              duration: duration,
              record: offline.record,
            });
          });

          runtimeData.forEach((item: any) => {
            const runStart = dayjs.utc(item.start_time).valueOf();
            const runEnd = dayjs.utc(item.end_time).valueOf();
            const motorState =
              item.motor_state === 1
                ? "ON"
                : item.motor_state === 0
                  ? "OFF"
                  : "Neutral";

            const overlappingOfflines = offlinePeriods
              .filter(
                (offline: any) =>
                  runStart < offline.end && runEnd > offline.start
              )
              .sort((a: any, b: any) => a.start - b.start);

            let currentStart = runStart;

            overlappingOfflines.forEach((offline: any) => {
              if (currentStart < offline.start) {
                const duration = offline.start - currentStart;
                const durationSeconds = Math.floor(duration / 1000);
                const durationHours = Math.floor(durationSeconds / 3600);
                const durationMinutes = Math.floor(
                  (durationSeconds % 3600) / 60
                );
                const durationSecs = durationSeconds % 60;
                const durationText = `${durationHours} h ${durationMinutes} m ${durationSecs} sec`;

                segments.push({
                  start: currentStart,
                  end: offline.start,
                  type: motorState,
                  duration: duration,
                  durationText: durationText,
                  record: {
                    ...item,
                    start_time: dayjs(currentStart).utc().format(),
                    end_time: dayjs(offline.start).utc().format(),
                    duration: durationText,
                  },
                });
              }

              currentStart = offline.end;

              if (currentStart > runEnd) {
                return;
              }
            });

            if (currentStart < runEnd) {
              const duration = runEnd - currentStart;
              const durationSeconds = Math.floor(duration / 1000);
              const durationHours = Math.floor(durationSeconds / 3600);
              const durationMinutes = Math.floor((durationSeconds % 3600) / 60);
              const durationSecs = durationSeconds % 60;
              const durationText = `${durationHours} h ${durationMinutes} m ${durationSecs} sec`;

              segments.push({
                start: currentStart,
                end: runEnd,
                type: motorState,
                duration: duration,
                durationText: durationText,
                record: {
                  ...item,
                  start_time: dayjs(currentStart).utc().format(),
                  end_time: dayjs(runEnd).utc().format(),
                  duration: durationText,
                },
              });
            }
          });

          segments.sort((a, b) => a.start - b.start);

          const uniqueSegments: any[] = [];
          const offlineSegs = segments.filter((seg) => seg.type === "OFFLINE");

          segments.forEach((segment) => {
            const isDuplicate = uniqueSegments.some(
              (existing) =>
                existing.start === segment.start &&
                existing.end === segment.end &&
                existing.type === segment.type
            );

            if (!isDuplicate) {
              if (segment.type !== "OFFLINE") {
                const isWithinOffline = offlineSegs.some(
                  (offline) =>
                    segment.start >= offline.start && segment.end <= offline.end
                );

                if (!isWithinOffline) {
                  uniqueSegments.push(segment);
                }
              } else {
                uniqueSegments.push(segment);
              }
            }
          });

          const onPoints: any[] = [];
          const offPoints: any[] = [];
          const offlinePoints: any[] = [];

          uniqueSegments.forEach((segment) => {
            if (segment.type === "OFFLINE") {
              offlinePoints.push(
                {
                  x: segment.start,
                  y: 2,
                  offlineRecord: segment.record,
                  marker: { enabled: true },
                },
                {
                  x: segment.end,
                  y: 2,
                  offlineRecord: segment.record,
                  marker: { enabled: true },
                },
                {
                  x: segment.end,
                  y: null,
                }
              );
            } else if (segment.type === "ON") {
              onPoints.push(
                {
                  x: segment.start,
                  y: 3,
                  record: segment.record,
                  marker: { enabled: true },
                },
                {
                  x: segment.end,
                  y: 3,
                  record: segment.record,
                  marker: { enabled: true },
                },
                {
                  x: segment.end,
                  y: null,
                }
              );
            } else if (segment.type === "OFF") {
              offPoints.push(
                {
                  x: segment.start,
                  y: 3,
                  record: segment.record,
                  marker: { enabled: true },
                },
                {
                  x: segment.end,
                  y: 3,
                  record: segment.record,
                  marker: { enabled: true },
                },
                {
                  x: segment.end,
                  y: null,
                }
              );
            }
          });

          if (offlinePoints.length > 0) {
            seriesData.push({
              name: "OFFLINE",
              color: "#6b7280",
              step: "left",
              data: offlinePoints,
              showInLegend: true,
              lineWidth: 2,
              marker: {
                radius: 5,
                fillColor: "#6b7280",
              },
            });
          }

          if (onPoints.length > 0) {
            seriesData.push({
              name: "ON",
              color: "#16A34A",
              step: "left",
              data: onPoints,
              showInLegend: true,
              lineWidth: 3,
              marker: { radius: 5, fillColor: "#16A34A" },
            });
          }

          if (offPoints.length > 0) {
            seriesData.push({
              name: "OFF",
              color: "#FF0000",
              step: "left",
              data: offPoints,
              showInLegend: true,
              lineWidth: 3,
              marker: { radius: 5, fillColor: "#FF0000" },
            });
          }

          return seriesData;
        })(),
      };
    }

    const multipleMotorsData = processMultipleMotorsData(data, paramater);
    if (multipleMotorsData) {
      return {
        chart: {
          type: "line",
          height: 250,
          backgroundColor: "transparent",
          zooming: {
            type: "x",
            mouseWheel: {
              enabled: true,
              type: "x",
              sensitivity: 0.1,
            },
          },
        },
        title: { text: "" },
        legend: {
          enabled: true,
          itemMarginTop: 2,
          itemMarginBottom: 2,
          symbolPadding: 3,
          itemStyle: {
            fontSize: "10px",
          },
        },
        xAxis: {
          lineWidth: 1,
          lineColor: "#BFC1C6",
          tickWidth: 0,
          categories: multipleMotorsData.categories,
          title: { text: "Time" },
          labels: {
            style: { fontSize: "10px" },
            rotation: -45,
          },
          minRange: 1,
        },
        yAxis: {
          gridLineDashStyle: "Dash",
          lineWidth: 1,
          lineColor: "#BFC1C6",
          tickWidth: 0,
          title: { text: "" },
          labels: {
            style: { fontSize: "10px" },
            formatter: function (this: any) {
              const unit =
                paramater === "voltage"
                  ? " V"
                  : paramater === "current"
                    ? " A"
                    : "";
              return `${this.value}${unit}`;
            },
          },
          max: paramater === "voltage" ? 500 : undefined,
          endOnTick: true,
          tickAmount: 5,
        },
        credits: { enabled: false },
        plotOptions: {
          line: {
            marker: { enabled: false, radius: 3 },
          },
        },
        tooltip: {
          shared: true,
          useHTML: true,
          formatter: function (this: any) {
            const points = this.points;
            if (!points) return "";
            const index = points[0].point.index;
            const timestamp = multipleMotorsData.timestamps?.[index];
            const fallbackLabel = multipleMotorsData.categories?.[index];
            const timeFormatted = timestamp
              ? dayjs
                  .utc(timestamp)
                  .tz("Asia/Kolkata")
                  .format("DD-MM-YYYY, HH:mm:ss")
              : fallbackLabel || "";

            let tooltip = `<div style="font-size: 10px; font-weight: bold;">${timeFormatted}</div>`;

            points.forEach((point: any) => {
              if (point.y !== null) {
                const value = point.y.toFixed(2);
                const color = point.series.color;
                const unit =
                  paramater === "voltage"
                    ? " V"
                    : paramater === "current"
                      ? " A"
                      : "";
                const label = capitalize(point.series.name);
                tooltip += `<div style="font-size: 10px;"> <span style="color:${color}; font-size: 18px;">●</span>${label}: ${value}${unit}</div>`;
              }
            });
            return tooltip;
          },
        },
        series: multipleMotorsData.series,
      };
    }

    return {
      chart: {
        type: "line",
        height: 250,
        backgroundColor: "transparent",
        zooming: {
          type: "x",
          mouseWheel: {
            enabled: true,
            type: "x",
            sensitivity: 0.1,
          },
        },
        events: {
          load: function (this: any) {
            const chart = this;
            chart.container.addEventListener(
              "wheel",
              function (event: WheelEvent) {
                event.preventDefault();
                const zoomFactor = 0.1;
                const delta = event.deltaY < 0 ? -1 : 1;
                const xAxis = chart.xAxis[0];
                if (!xAxis) return;
                const normalizedEvent = chart.pointer.normalize(event);
                const pointerX = xAxis.toValue(normalizedEvent.chartX);

                const extremes = xAxis.getExtremes();
                const min = extremes.min;
                const max = extremes.max;
                const oldRange = max - min;
                const fraction = (pointerX - min) / oldRange;
                const zoomMultiplier = 1 + zoomFactor * delta;
                const newRange = Math.max(1, oldRange * zoomMultiplier);
                let newMin = pointerX - fraction * newRange;
                let newMax = newMin + newRange;
                if (newMin < extremes.dataMin) {
                  newMin = extremes.dataMin;
                  newMax = newMin + newRange;
                }
                if (newMax > extremes.dataMax) {
                  newMax = extremes.dataMax;
                  newMin = newMax - newRange;
                }
                newMin = Math.max(extremes.dataMin, newMin);
                newMax = Math.min(extremes.dataMax, newMax);

                xAxis.setExtremes(newMin, newMax, true);
                chart.redraw();
              }
            );
          },
        },
      },
      title: { text: "" },
      legend: {
        enabled: true,
        itemMarginTop: 2,
        itemMarginBottom: 2,
        symbolPadding: 3,
        itemStyle: {
          fontSize: "10px",
        },
      },
      xAxis: {
        lineWidth: 1,
        lineColor: "#BFC1C6",
        tickWidth: 0,
        categories: Array.isArray(data)
          ? data.map((item: any) =>
              dayjs.utc(item?.time_stamp).tz("Asia/Kolkata").format("HH:mm")
            )
          : [],
        title: { text: "Time" },
        labels: { style: { fontSize: "10px" } },
        minRange: 1,
      },
      yAxis: {
        gridLineDashStyle: "Dash",
        lineWidth: 1,
        lineColor: "#BFC1C6",
        tickWidth: 0,
        title: { text: "" },
        labels: {
          style: { fontSize: "10px" },
          formatter: function (this: any) {
            const unit =
              paramater === "voltage"
                ? " V"
                : paramater === "current"
                  ? " A"
                  : "";
            return `${this.value}${unit}`;
          },
        },
        max: paramater === "voltage" ? 500 : undefined,
        endOnTick: true,
        tickAmount: 5,
      },
      credits: { enabled: false },
      plotOptions: {
        line: {
          marker: { enabled: false },
        },
      },
      tooltip: {
        shared: true,
        useHTML: true,
        formatter: function (this: any) {
          const points = this.points;
          if (!points) return "";
          const index = points[0].point.index;
          const rawTimestamp = data[index]?.time_stamp;
          const timeOnly = dayjs
            .utc(rawTimestamp)
            .tz("Asia/Kolkata")
            .format("DD-MM-YYYY, HH:mm:ss");
          let tooltip = `<div style="font-size: 10px;">${timeOnly}</div>`;
          points.forEach((point: any) => {
            const value = point.y?.toFixed(2);
            const color = point.series.color;
            const unit =
              paramater === "voltage"
                ? " V"
                : paramater === "current"
                  ? " A"
                  : "";
            const label = point.series.name;
            tooltip += `<div style="font-size: 10px;"> <span style="color:${color}; font-size: 16px ;">●</span>${label}: ${value}${unit}</div>`;
          });
          return tooltip;
        },
      },
      series:
        paramater === "voltage"
          ? [
              {
                name: "R",
                color: "#FF3131",
                data: data.map((item: any) => item?.line_voltage_vry || 0),
                marker: { symbol: "circle" },
              },
              {
                name: "Y",
                color: "#FDDA0D",
                data: data.map((item: any) => item?.line_voltage_vyb || 0),
                marker: { symbol: "circle" },
              },
              {
                name: "B",
                color: "#0096FF",
                data: data.map((item: any) => item?.line_voltage_vbr || 0),
                marker: { symbol: "circle" },
              },
            ]
          : [
              {
                name: "R",
                color: "#FF3131",
                data: data.map((item: any) => item?.current_i1 || 0),
                marker: { symbol: "circle" },
              },
              {
                name: "Y",
                color: "#FDDA0D",
                data: data.map((item: any) => item?.current_i2 || 0),
                marker: { symbol: "circle" },
              },
              {
                name: "B",
                color: "#0096FF",
                data: data.map((item: any) => item?.current_i3 || 0),
                marker: { symbol: "circle" },
              },
            ],
    };
  }, [data, paramater]);


  useEffect(() => {
  if (prevMotorIdRef.current !== memoizedMotorData.motor_id) {
    setDate(getDefaultRange());
    prevMotorIdRef.current = memoizedMotorData.motor_id;
  }
}, [memoizedMotorData.motor_id, setDate]);

  
  return (
    <div className="relative">
      {!hideDatePicker &&
        (paramater === "runtime" ||
        hideDatePicker ||
        (paramater === "voltage" &&
          (noMotors ||
            isDashboardRoute ||
            memoizedMotorData.motor_id === "mtr_1" ||
            memoizedMotorData.motor_id === "mtr_2")) ? (
          <div className="mb-2 flex justify-end ">
            {/* <DateRangePicker
              key={memoizedMotorData?.motor_id}
              value={dateValue}
              onChange={updateDateValues}
              placement="bottomEnd"
              size="sm"
              shouldDisableDate={afterToday()}
            /> */}
            <CustomDateCalendar
              date={date}
              setDate={setDate}
              align={"start"}
              title={"Select Date"}
              disablePast={false}
              disableFuture={true}
              isTimePicker={false}
            />
          </div>
        ) : null)}

      <figure className="highcharts-figure rounded-xl w-full overflow-hidden bg-white border border-gray-200 ">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            {paramater === "voltage" ? (
              <ThunderIcon className="h-4 w-4" />
            ) : paramater === "current" ? (
              <MeterIcon className="h-4 w-4" />
            ) : (
              <ClockIcon className="h-4 w-4" />
            )}
            <div className="capitalize">{paramater}</div>
          </div>
          {paramater === "runtime" && durationCount && (
            <div className="text-xs text-gray-600 font-medium">
              Runtime: <span className="text-green-600">{durationCount}</span>
            </div>
          )}
        </div>
        {((paramater === "runtime" &&
          (!data?.run_Time_data || data?.run_Time_data?.length === 0)) ||
          (paramater !== "runtime" &&
            (!Array.isArray(data) || data.length === 0))) &&
        !isLoading ? (
          <div className="h-[175px] flex items-center justify-center">
            No data found
          </div>
        ) : (
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        )}
      </figure>
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <img src="/PeepulAgriLogo.svg" alt="Logo" className="w-32 h-32" />
        </div>
      )}
    </div>
  );
};

export default HighCharts;
