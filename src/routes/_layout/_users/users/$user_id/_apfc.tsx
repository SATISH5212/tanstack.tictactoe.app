import UserBasedApfcDevices from "@/components/devices/apfc/UserBasedApfcDevices";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/_users/users/$user_id/_apfc")({
  component: UserBasedApfcDevices,
});
