import { GetAllAPFCDevices } from "@/components/devices/apfc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/_apfc")({
  component: GetAllAPFCDevices,
});
