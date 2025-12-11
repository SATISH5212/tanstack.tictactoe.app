import { createFileRoute } from "@tanstack/react-router";
import Level1Settings from "@/components/devices/apfc/settings/Level1Settings";

export const Route = createFileRoute(
  "/_layout/_users/users/$user_id/_apfc/apfc/$apfc_id/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Level1Settings />
    </div>
  );
}
