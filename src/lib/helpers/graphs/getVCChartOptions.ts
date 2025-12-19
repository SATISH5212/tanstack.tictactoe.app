import Highcharts from "highcharts";
import dayjs from "dayjs";

type GraphType = "voltage" | "current";

export function getVCChartOptions(
  data: any[],
  graphType: GraphType
): Highcharts.Options {
  const safeData = Array.isArray(data) ? data : [];

  return {
    chart: {
      type: "line",
      height: 200,
    },
    title: { text: "" },
    xAxis: {
      categories: safeData.map((d: any) =>
        dayjs(d.time_stamp).format("HH:mm")
      ),
    },
    yAxis: {
      title: {
        text: graphType === "voltage"
          ? "Voltage (V)"
          : "Current (A)",
      },
    },
    series:
      graphType === "voltage"
        ? [
          { type: "line", name: "R", data: safeData.map((d: any) => d.line_voltage_r), },
          { type: "line", name: "Y", data: safeData.map((d: any) => d.line_voltage_y), },
          { type: "line", name: "B", data: safeData.map((d: any) => d.line_voltage_b), },
        ] : [
          { type: "line", name: "R", data: safeData.map((d: any) => d.current_r), },
          { type: "line", name: "Y", data: safeData.map((d: any) => d.current_y), },
          { type: "line", name: "B", data: safeData.map((d: any) => d.current_b), },
        ],
  };
}
