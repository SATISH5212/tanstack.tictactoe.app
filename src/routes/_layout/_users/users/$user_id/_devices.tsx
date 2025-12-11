import UserBasedDevices from "@/components/devices/UserBasedDevices";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/_users/users/$user_id/_devices")(
  {
    component: UserBasedDevices,
  }
);
