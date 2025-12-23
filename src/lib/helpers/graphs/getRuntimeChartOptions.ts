import { ChartPoint, RunTimeData } from "@/lib/interfaces/graphs";
import Highcharts from "highcharts";
import { formatUtcToLocal } from "../timeFormat";

export function getRuntimeChartOptions(
    data: RunTimeData[],
    totalMotorONRunTime: string
): Highcharts.Options {
    const runtimeData = Array.isArray(data) ? data : [];

    const onSeries: ChartPoint[] = [];
    const offSeries: ChartPoint[] = [];
    const powerSeries: (number | null)[][] = [];

    runtimeData.forEach((item) => {
        if (item.start_time && item.end_time) {
            const start = new Date(item.start_time).getTime();
            const end = new Date(item.end_time).getTime();

            if (item.motor_state === 1) {
                onSeries.push(
                    { x: start, y: 1, duration: item.duration },
                    { x: end, y: 1, duration: item.duration },
                    { x: end + 1, y: null, duration: null }
                );
            } else {
                offSeries.push(
                    { x: start, y: 0, duration: item.duration },
                    { x: end, y: 0, duration: item.duration },
                    { x: end + 1, y: null, duration: null }
                );
            }

            powerSeries.push(
                [start, 0.5],
                [end, 0.5],
                [end + 1, null]
            );
        } else if (item.start_time && !item.end_time) {
            const start = new Date(item.start_time).getTime();
            const now = Date.now();

            powerSeries.push(
                [start, 0.5],
                [now, 0.5]
            );
        }
    });

    return {
        chart: {
            type: "line",
            height: 120,
        },

        credits: { enabled: false },
        title: { text: "" },

        xAxis: {
            type: "datetime",
        },

        yAxis: {
            visible: false,
            min: -0.5,
            max: 1.5,
        },

        tooltip: {
            shared: false,
            formatter: function () {
                const point = this as Highcharts.Point & {
                    duration?: string | null;
                };

                const seriesName = point.series.name;
                const time = formatUtcToLocal(point.x as number);

                if (seriesName === "Power") {
                    return `<strong>${seriesName}</strong><br/>${time}`;
                }

                if (point.duration) {
                    return `
        <strong>${seriesName}</strong><br/>
        ${time}<br/>
        Duration: ${point.duration}
      `;
                }

                return false;
            },
        },


        plotOptions: {
            series: {
                marker: { enabled: false },
                connectNulls: false,
                step: "left",
            },
        },

        series: [
            {
                type: "line",
                name: "Power",
                color: "#3b82f6",
                lineWidth: 3,
                data: powerSeries,
                zIndex: 3,
            },
            {
                type: "line",
                name: "ON",
                color: "#16a34a",
                lineWidth: 2,
                data: onSeries,
                zIndex: 2,
            },
            {
                type: "line",
                name: "OFF",
                color: "#dc2626",
                lineWidth: 2,
                data: offSeries,
                zIndex: 1,
            },
        ],
    };
}
