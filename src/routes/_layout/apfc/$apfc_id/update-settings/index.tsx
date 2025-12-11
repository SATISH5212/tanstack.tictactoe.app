import EditSettings from "@/components/devices/apfc/settings/editSettings";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/apfc/$apfc_id/update-settings/")(
  {
    component: EditSettings,
  }
);
