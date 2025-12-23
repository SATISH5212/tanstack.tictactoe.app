import { ChartPoint, RunTimeData } from "@/lib/interfaces/graphs";
import Highcharts from "highcharts";

export function getRuntimeChartOptions(
    data: RunTimeData[],
    totalMotorONRunTime: string,
): Highcharts.Options {
    const runtimeData = Array.isArray(data) ? data : [];
    const onSeries: ChartPoint[] = [];
    const offSeries: ChartPoint[] = [];
    const powerSeries: (number | null)[][] = [];
      runtimeData.forEach((item: RunTimeData) => {
        if (item.start_time && item.end_time) {
            const start = new Date(item.start_time).getTime();
            const end = new Date(item.end_time).getTime();

            if (item.motor_state === 1) {
                onSeries.push(
                    { x: start, y: 1, duration: item.duration },
                    { x: end, y: 1, duration: item.duration },
                    { x: end + 1, y: null, duration: null }
                );
            } else if (item.motor_state === 0) {
                offSeries.push(
                    { x: start, y: 0, duration: item.duration },
                    { x: end, y: 0, duration: item.duration },
                    { x: end + 1, y: null, duration: null }
                );
            }
        }

        if (item.start_time && item.end_time) {
            const powerStart = new Date(item.start_time).getTime();
            const powerEnd = new Date(item.end_time).getTime();

            powerSeries.push(
                [powerStart, 0.5],
                [powerEnd, 0.5],
                [powerEnd + 1, null]
            );
        } else if (item.start_time && !item.end_time) {
            const powerStart = new Date(item.start_time).getTime();
            const now = new Date().getTime();

            powerSeries.push(
                [powerStart, 0.5],
                [now, 0.5]
            );
        }
    });

    return {
        chart: {
            type: "line",
            height: 120,
        },
        credits: {
            enabled: false,
        },
        title: { text: "" },
        xAxis: {
            type: "datetime",
            dateTimeLabelFormats: {
                hour: '%l:%M %p',
                day: '%b %e',
            },
        },
        yAxis: {
            visible: false,
            min: -0.5,
            max: 1.5,
        },
        tooltip: {
            shared: false,
            formatter: function (this: any) {
                const point = this.point;
                const seriesName = this.series.name;
                const date = Highcharts.dateFormat('%A, %b %e, %l:%M:%S %p', this.x);

                if (seriesName === 'Power') {
                    return `<b>${seriesName}</b><br/>${date}`;
                } else if (point.duration) {
                    return `<b>${seriesName}</b><br/>${date}<br/>Duration: ${point.duration}`;
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