import UserBasedApfcDeviceDetails from "@/components/devices/apfc/apfcDeviceDetails/UserBasedApfcDeviceDetails";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_layout/_users/users/$user_id/_apfc/apfc/$apfc_id/details/"
)({
  component: UserBasedApfcDeviceDetails,
});
