import MotorDetails from "@/components/deviceSettings/MotorDetails";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_layout/_devices/devices/$device_id/_motors"
)({
  component: () => <MotorDetails />,
});
