import { PondsProvider } from "@/components/context/PondsDataprovider";
import PondsTableView from "@/components/dashboard/pondsTableView";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/_ponds")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <PondsProvider>
        <PondsTableView />
      </PondsProvider>
    </div>
  );
}
