import { LocationProvider } from "@/components/context/LocationContext";
import { MqttConnectionProvider } from "@/components/context/MqttConnectionContext";
import { PondProvider } from "@/components/context/PondsProvider";
import { AppSideBar } from "@/components/SideBar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PondProvider>
      <LocationProvider>
        <MqttConnectionProvider>
          <div className="font-inter">
            <AppSideBar />
          </div>
        </MqttConnectionProvider>
      </LocationProvider>
    </PondProvider>
  );
}