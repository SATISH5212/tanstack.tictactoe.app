import SingleApfcDeviceSettings from "@/components/devices/apfc/settings";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/_apfc/apfc/$apfc_id/settings/")({
  component: SingleApfcDeviceSettings,
});
