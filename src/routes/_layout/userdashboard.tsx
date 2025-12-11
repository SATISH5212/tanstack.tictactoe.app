import { createFileRoute } from "@tanstack/react-router";

// Define the Route
export const Route = createFileRoute("/_layout/userdashboard")({
  component: RouteComponent,
});

// Dashboard Component
function RouteComponent() {
  return (
    <>
      Dashboard
    </>
  );
}
