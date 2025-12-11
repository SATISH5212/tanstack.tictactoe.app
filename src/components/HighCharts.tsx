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
import { ClockIcon } from "./svg/ClockIcon";
import { MeterIcon } from "./svg/MeterIcon";
import { ThunderIcon } from "./svg/ThunderIcon";

dayjs.extend(utc);
dayjs.extend(timezone);

const HighCharts: FC<any> = (props: any) => {
  const { afterToday } = DateRangePicker;
  const location = useLocation();
  const isPondsRoute = location.pathname.includes("/ponds/");
  const isDashboardRoute = location.pathname.includes("/dashboard");
  const isDeviceGraph = location.pathname.includes("/mtr_1")  || location.pathname.includes("/mtr_2"); // stop the runtime graph at view raw data
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
  } = props;

  const hasInitializedRef = useRef(false);
 

  useEffect(() => {
    if (
      !hasInitializedRef.current &&
      !dateValue &&
      setDateValue &&
      setDateRange
    ) {
      const fromDate = dayjs()
        .subtract(24, "hour")
        .startOf("minute")
        .format("YYYY-MM-DD");
      const toDate = dayjs().format("YYYY-MM-DD");
      const defaultDateArray = [
        dayjs(fromDate).toDate(),
        dayjs(toDate).toDate(),
      ];
      setDateValue(defaultDateArray);
      setDateRange({ from_date: fromDate, to_date: toDate });
      hasInitializedRef.current = true;
    }
  }, [dateValue, setDateValue, setDateRange]);

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


  
  const updateDateValues = useCallback(
    (newDate: any) => {
      if (
        Array.isArray(newDate) &&
        newDate.length === 2 &&
        newDate[0] &&
        newDate[1]
      ) {
        const fromDate = dayjs(newDate[0]).format("YYYY-MM-DD");
        const toDate = dayjs(newDate[1]).format("YYYY-MM-DD");
        setDateValue(newDate);
        setDateRange({ from_date: fromDate, to_date: toDate });
      } else {
        setDateValue([]);
        setDateRange(null);
      }
    },
    [setDateValue, setDateRange]
  );

  const { data: durationCount } = useQuery({
    queryKey: [
      "durationCount",
      dateRange?.from_date,
      dateRange?.to_date,
      memoizedMotorData?.motor_id,
      memoizedMotorData?.motor_ref_id,
    ],
    queryFn: async () => {
      const queryParams = {
        from_date: dateRange?.from_date || "",
        to_date: dateRange?.to_date || "",
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
      !!dateRange?.from_date &&
      !!dateRange?.to_date,
  });

  const fetchGraphData = useCallback(async () => {
    const queryParams = {
      from_date: dateRange.from_date || "",
      to_date: dateRange.to_date || "",
    };

    try {
      let response;

      // Handle runtime parameter separately (doesn't support multiple motors)
      if (paramater === "runtime" && selectedMotorsPayload == null && !isDeviceGraph) {
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
    dateRange?.from_date,
    dateRange?.to_date,
    noMotors,
    selectedMotorsPayload,
    isMultipleMotorsSelected,
    isDeviceGraph
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
      dateRange?.from_date,
      dateRange?.to_date,
      selectedMotorsPayload,
      isMultipleMotorsSelected,
    ],
    queryFn: fetchGraphData,
    enabled:
      (!!memoizedMotorData.starter_id &&
        !!memoizedMotorData.motor_id &&
        !!dateRange?.from_date &&
        !!dateRange?.to_date) ||
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
                  <div style="font-weight: bold; color: #6b7280;">Offline</div>
                  <div>Start: ${startTime}</div>
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
              <div style="font-weight: bold;">${state}</div>
              <div>End: ${endTime}</div>
              <div>Duration: ${duration}</div>
            </div>`;
          },
        },
        series: (() => {
          const seriesData: any[] = [];

          if (!Array.isArray(runtimeData) || runtimeData.length === 0) {
            return seriesData;
          }

          const onPoints: any[] = [];
          const offPoints: any[] = [];
          const offlinePoints: any[] = [];

          // --- BUILD ON & OFF ---
          runtimeData.forEach((item: any) => {
            const start = dayjs.utc(item.start_time).valueOf();
            const end = dayjs.utc(item.end_time).valueOf();

            const range = [
              { x: start, y: 3, record: item, marker: { enabled: false } },
              { x: end, y: 3, record: item, marker: { enabled: true } },
            ];

            if (item.motor_state === 1) {
              onPoints.push(...range);
            } else if (item.motor_state === 0) {
              offPoints.push(...range);
            }
          });

          const offlinePeriods = data?.off_line_periods || [];

          offlinePeriods.forEach((period: any) => {
            const start = dayjs.utc(period.start).valueOf();
            const end = period.ongoing
              ? dayjs.utc().valueOf()
              : dayjs.utc(period.end).valueOf();

            const range = [
              {
                x: start,
                y: 2,
                offlineRecord: period,
                marker: { enabled: false },
              },
              {
                x: end,
                y: 2,
                offlineRecord: period,
                marker: { enabled: true },
              },
            ];

            offlinePoints.push(...range);
          });

          // ------------ ADD SERIES CLEANLY -----------
          if (offlinePoints.length > 0) {
            seriesData.push({
              name: "OFFLINE",
              color: "#6b7280",
              step: "left",
              data: offlinePoints,
              showInLegend: true,
              lineWidth: 3,
              zIndex: 1,
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
              zIndex: 3,
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
              zIndex: 2,
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

  if (error) {
    return (
      <div className="relative">
        {paramater === "voltage" &&  (
          <div className="text-end mb-2">
            <DateRangePicker
              value={dateValue}
              onChange={updateDateValues}
              placement="bottomEnd"
            />
          </div>
        )}
        <figure className="highcharts-figure rounded-xl w-full overflow-hidden bg-white border border-gray-200">
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
          </div>

          <div className="h-[175px] flex items-center justify-center">
            <span>No Data Available </span>
          </div>
        </figure>
      </div>
    );
  }
  return (
    <div className="relative">
      {!hideDatePicker &&
        (paramater === "runtime" ||
        hideDatePicker ||
        (paramater === "voltage" &&
          (noMotors ||
            isPondsRoute ||
            isDashboardRoute ||
            memoizedMotorData.motor_id === "mtr_1" ||
            memoizedMotorData.motor_id === "mtr_2")) ? (
          <div className="text-end mb-2">
            <DateRangePicker
              value={dateValue}
              onChange={updateDateValues}
              placement="bottomEnd"
              size="sm"
              shouldDisableDate={afterToday()}
            />
          </div>
        ) : null)}
      {/* {!hideDatePicker &&
      (paramater === "runtime" ||
        (paramater === "voltage" &&
          (noMotors ||
            isPondsRoute ||
            isDashboardRoute ||
            memoizedMotorData.motor_id === "mtr_1" ||
            memoizedMotorData.motor_id === "mtr_2"))) ? (
        <div className="text-end mb-2">
          <DateRangePicker
            value={dateValue}
            onChange={updateDateValues}
            placement="bottomEnd"
            size="sm"
          />
        </div>
      ) : null} */}
      <figure className="highcharts-figure rounded-xl w-full overflow-hidden bg-white border border-gray-200">
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
