import { VCData } from "@/lib/interfaces/graphs";
import dayjs from "dayjs";
import Highcharts from "highcharts";

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
    credits: {
      enabled: false,
    },
    title: { text: "" },
    xAxis: {
      categories: safeData.map((d: VCData) => dayjs(d.time_stamp).format("HH:mm")),
    },
    yAxis: {
      title: {
        text: graphType === "voltage" ? "Voltage (V)" : "Current (A)",
      },
    },
    series:
      graphType === "voltage"
        ? [
          { type: "line", name: "R", color: 'red', data: safeData.map((d: VCData) => d.line_voltage_r), },
          { type: "line", name: "Y", color: "yellow", data: safeData.map((d: VCData) => d.line_voltage_y), },
          { type: "line", name: "B", color: "blue", data: safeData.map((d: VCData) => d.line_voltage_b), },
        ] : [
          { type: "line", name: "R", color: "red", data: safeData.map((d: VCData) => d.current_r), },
          { type: "line", name: "Y", color: "yellow", data: safeData.map((d: VCData) => d.current_y), },
          { type: "line", name: "B", color: "blue", data: safeData.map((d: VCData) => d.current_b), },
        ],
  };
}
