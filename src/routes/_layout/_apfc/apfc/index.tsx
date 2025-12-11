import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/_apfc/apfc/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div></div>;
}
