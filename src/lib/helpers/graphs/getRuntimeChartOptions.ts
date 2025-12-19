import Highcharts from "highcharts";

export function getRuntimeChartOptions(
    data: any[]
): Highcharts.Options {
    const runtimeData = Array.isArray(data) ? data : [];

    const onSeries: (number | null)[][] = [];
    const offSeries: (number | null)[][] = [];

    runtimeData.forEach((item: any) => {
        const start = new Date(item.start_time).getTime();
        const end = new Date(item.end_time).getTime();

        if (item.motor_state === 1) {
            onSeries.push(
                [start, 1],
                [end, 1],
                [end + 1, null]
            );
        } else {
            offSeries.push(
                [start, 0],
                [end, 0],
                [end + 1, null]
            );
        }
    });

    return {
        chart: {
            type: "line",
            height: 120,
        },
        title: { text: "" },
        xAxis: {
            type: "datetime",
        },
        yAxis: {
            visible: false,
            min: -0.5,
            max: 1.5,
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
                name: "Motor ON",
                color: "#16a34a",
                lineWidth: 2,
                data: onSeries,
            },
            {
                type: "line",
                name: "Motor OFF",
                color: "#dc2626",
                lineWidth: 2,
                data: offSeries,
            },
        ],
    };
}
