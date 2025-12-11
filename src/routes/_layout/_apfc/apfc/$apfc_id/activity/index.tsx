import ActivityGraph from "@/components/devices/apfc/settings/ActivityGraph";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/_apfc/apfc/$apfc_id/activity/")({
  component: ActivityGraph,
});
