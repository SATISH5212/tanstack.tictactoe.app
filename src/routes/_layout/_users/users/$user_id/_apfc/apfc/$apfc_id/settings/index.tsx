import SingleApfcDeviceSettings from "@/components/devices/apfc/settings";
import UserBasedApfcDevices from "@/components/devices/apfc/UserBasedApfcDevices";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_layout/_users/users/$user_id/_apfc/apfc/$apfc_id/settings/"
)({
  component: SingleApfcDeviceSettings,
});
