import ApfcDeviceDetails from "@/components/devices/apfc/apfcDeviceDetails";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/_apfc/apfc/$apfc_id/details/")({
  component: ApfcDeviceDetails,
});
