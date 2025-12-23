import { VCData } from "@/lib/interfaces/graphs";
import Highcharts from "highcharts";
import { formatUtcToLocal } from "../timeFormat";


type GraphType = "voltage" | "current";

export function getVCChartOptions(
  data: VCData[],
  graphType: GraphType
): Highcharts.Options {
  const safeData = Array.isArray(data) ? data : [];

  return {
    chart: {
      type: "line",
      height: 200,
    },

    credits: { enabled: false },
    title: { text: "" },

    xAxis: {
      type: "datetime",
    },
   

    tooltip: {
      shared: true,
      useHTML: true,
      formatter: function () {
        const unit = graphType === "voltage" ? "V" : "A";
        const time = formatUtcToLocal(this.x as number);

        let html = `<div>${time}</div>`;

        this.points?.forEach((point) => {
          html += `
            <div>
              <span style="color:${point.color}">●</span>
              ${point.series.name}: <b>${point.y}</b> ${unit}
            </div>
          `;
        });

        return html;
      },
    },

    yAxis: {
      title: {
        text: graphType === "voltage" ? "Voltage (V)" : "Current (A)",
      },
    },

    series:
      graphType === "voltage"
        ? [
          {
            type: "line",
            name: "R",
            color: "red",
            data: safeData.map((d) => [
              new Date(d.time_stamp).getTime(),
              d.line_voltage_r,
            ]),
          },
          {
            type: "line",
            name: "Y",
            color: "yellow",
            data: safeData.map((d) => [
              new Date(d.time_stamp).getTime(),
              d.line_voltage_y,
            ]),
          },
          {
            type: "line",
            name: "B",
            color: "#3b82f6",
            data: safeData.map((d) => [
              new Date(d.time_stamp).getTime(),
              d.line_voltage_b,
            ]),
          },
        ]
        : [
          {
            type: "line",
            name: "R",
            color: "red",
            data: safeData.map((d) => [
              new Date(d.time_stamp).getTime(),
              d.current_r,
            ]),
          },
          {
            type: "line",
            name: "Y",
            color: "yellow",
            data: safeData.map((d) => [
              new Date(d.time_stamp).getTime(),
              d.current_y,
            ]),
          },
          {
            type: "line",
            name: "B",
            color: "#3b82f6",
            data: safeData.map((d) => [
              new Date(d.time_stamp).getTime(),
              d.current_b,
            ]),
          },
        ],
  };
}
