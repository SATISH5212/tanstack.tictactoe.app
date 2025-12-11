import DeviceGraphs from "@/components/devices/DeviceGraphs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_layout/_devices/devices/$device_id/_motors/motors/$motor_id/"
)({
  component: DeviceGraphs,
});
