
import { UserBasedDevicesMotors } from "@/components/users/UserBasedDevicesMotors";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_layout/_users/users/$user_id/_devices/devices/$device_id/"
)({
  component: UserBasedDevicesMotors,
});
