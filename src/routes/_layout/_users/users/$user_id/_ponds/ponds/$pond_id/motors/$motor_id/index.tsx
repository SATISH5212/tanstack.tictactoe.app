
import UserBasedPondMotors from "@/components/users/UserBasedPondMotors";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_layout/_users/users/$user_id/_ponds/ponds/$pond_id/motors/$motor_id/"
)({
  component: UserBasedPondMotors,
});
