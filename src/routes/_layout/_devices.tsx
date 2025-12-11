import { GetAllDevices } from "@/components/devices/GetAllDevices";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/_devices")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="h-[90.5vh] overflow-hidden">
      <GetAllDevices />
    </div>
  );
}
